"use client";
import { useState } from "react";

export default function CreatePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (data.result) {
        setResult(data.result); // Testo generato
      } else {
        setResult(
          "Error generating content: " + (data.error || "Unknown error")
        );
      }

      if (data.image) {
        setImage(data.image); // Immagine generata
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setResult("An error occurred while generating content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">Create Your Content</h1>
      <textarea
        className="w-full max-w-2xl p-3 border rounded-lg mb-4"
        rows={5}
        placeholder="Describe what you want to generate"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <button
        onClick={generateContent}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-md max-w-2xl">
          <h2 className="text-2xl font-semibold mb-2">Generated Content:</h2>
          <p className="text-gray-700 whitespace-pre-line">{result}</p>
          {image && <img src={image} alt="Generated Image" className="mt-4" />}
        </div>
      )}
    </div>
  );
}
