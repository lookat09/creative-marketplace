"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function HomePage() {
  const [actions, setActions] = useState([{ type: "car", value: 0 }]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar"); // Stato per il tipo di grafico

  const handleChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setActions(updatedActions);
  };

  const addAction = () => setActions([...actions, { type: "car", value: 0 }]);

  const calculateImpact = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error calculating impact:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepara i dati per il grafico
  const chartData =
    result?.details?.map((detail: any) => ({
      action: detail.type,
      emissions: detail.emissions,
    })) || [];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"]; // Colori per il grafico a torta

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        Calcola il tuo impatto ambientale
      </h1>
      {actions.map((action, index) => (
        <div key={index} className="mb-4">
          <select
            value={action.type}
            onChange={(e) => handleChange(index, "type", e.target.value)}
            className="p-2 border rounded-md mr-4"
          >
            <option value="car">Viaggio in auto (km)</option>
            <option value="meatMeal">Pasto a base di carne</option>
            <option value="dryer">Uso asciugatrice</option>
            <option value="shower">Doccia (10 min)</option>
            <option value="flight">Viaggio in aereo (km)</option>
          </select>
          <input
            type="number"
            value={action.value}
            onChange={(e) => handleChange(index, "value", +e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
      ))}
      <button
        onClick={addAction}
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4"
      >
        Aggiungi Azione
      </button>
      <button
        onClick={calculateImpact}
        className="px-4 py-2 bg-green-500 text-white rounded-md"
        disabled={loading}
      >
        {loading ? "Calcolando..." : "Calcola Impatto"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-white rounded-md shadow-md">
          <h2 className="text-2xl font-bold mb-4">Risultato:</h2>
          <p>
            <strong>Emissioni totali:</strong> {result.totalEmissions} kg CO₂
          </p>
          <p>
            <strong>Suggerimenti:</strong>
          </p>
          <p>{result.suggestions}</p>

          {/* Grafico */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Emissioni per azione</h3>
            {/* Bottone per cambiare il tipo di grafico */}
            <button
              onClick={() =>
                setChartType((prev) => (prev === "bar" ? "pie" : "bar"))
              }
              className="px-4 py-2 bg-indigo-500 text-white rounded-md mb-4"
            >
              Cambia in{" "}
              {chartType === "bar" ? "Diagramma a torta" : "Grafico a barre"}
            </button>

            {/* Grafico dinamico */}
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="#82ca9d" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="emissions"
                    nameKey="action"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.action}: ${entry.emissions} kg`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
