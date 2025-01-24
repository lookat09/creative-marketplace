import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { actions } = await req.json();

    if (!actions || !Array.isArray(actions)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Dati per il calcolo delle emissioni
    const emissionFactors = {
      car: 0.12, // kg CO₂ per km
      meatMeal: 5.0, // kg CO₂ per pasto
      dryer: 2.3, // kg CO₂ per uso
      shower: 0.7, // kg CO₂ per 10 min
      flight: 0.15, // kg CO₂ per km
    };

    // Calcolo delle emissioni dettagliate e totali
    let totalEmissions = 0;
    const details = actions.map((action: any) => {
      const factor = emissionFactors[action.type];
      const emissions = factor ? action.value * factor : 0;
      totalEmissions += emissions;

      return {
        type: action.type,
        value: action.value,
        emissions: emissions.toFixed(2), // Emissioni per questa azione
      };
    });

    // Richiesta a OpenAI per i suggerimenti
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Sei un assistente ambientale che fornisce consigli per ridurre l'impatto ambientale.",
            },
            {
              role: "user",
              content: `Ho emesso un totale di ${totalEmissions.toFixed(
                2
              )} kg di CO₂ oggi. Cosa posso fare per ridurre il mio impatto?`,
            },
          ],
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorDetails = await openaiResponse.text();
      console.error("OpenAI API Error:", errorDetails);
      return NextResponse.json(
        { error: "Failed to generate suggestions", details: errorDetails },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const suggestions = openaiData.choices[0]?.message?.content.trim() || "";

    return NextResponse.json({
      totalEmissions: totalEmissions.toFixed(2),
      details, // Aggiungiamo i dettagli per il grafico
      suggestions,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
