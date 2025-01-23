import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 1. Generazione del testo con GPT-3
    const gptResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process?.env?.OPEN_AI_KEY}`, // Inserisci la tua chiave API
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Modello gpt-3.5-turbo
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (gptResponse.status === 429) {
      console.log("Rate limit reached, retrying in 30 seconds...");
    }

    if (!gptResponse.ok) {
      const errorDetails = await gptResponse.json().catch(() => ({
        error: "Unable to parse error response",
      }));

      console.error("GPT API Error Response:", errorDetails);

      return NextResponse.json(
        {
          error: "Failed to generate content",
          details: errorDetails,
        },
        { status: gptResponse.status }
      );
    }

    const gptData = await gptResponse.json();
    let generatedText = "";
    if (gptData.choices && gptData.choices[0] && gptData.choices[0].message) {
      // Estrai il contenuto dal messaggio (content)
      generatedText = gptData.choices[0].message.content.trim();
    } else {
      console.error("Unexpected response format:", gptData);
      return NextResponse.json(
        { error: "Unexpected API response from GPT-3" },
        { status: 500 }
      );
    }

    // 2. Generazione dell'immagine con DALL·E
    const dalleResponse = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process?.env?.OPEN_AI_KEY}`, // Inserisci la tua chiave API
        },
        body: JSON.stringify({
          prompt: prompt, // Usa lo stesso prompt per generare l'immagine
          n: 1,
          size: "1024x1024",
        }),
      }
    );

    if (!dalleResponse.ok) {
      const errorResponse = await dalleResponse.text(); // Prendi il corpo della risposta
      console.error("DALL·E API Error Response:", errorResponse); // Log dell'errore
      return NextResponse.json(
        { error: "Failed to generate image", details: errorResponse },
        { status: dalleResponse.status }
      );
    }

    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to retrieve image URL" },
        { status: 500 }
      );
    }

    // Restituisci sia il testo che l'immagine nella risposta
    return NextResponse.json({
      result: generatedText, // Testo generato
      image: imageUrl, // URL dell'immagine generata
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
