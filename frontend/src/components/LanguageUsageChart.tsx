// Language Usage Donut Chart Component
// Displays a donut chart showing programming language distribution
// Uses Recharts library for visualization

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface LanguageUsageChartProps {
  languages: Record<string, number>;
}

export default function LanguageUsageChart({ languages }: LanguageUsageChartProps) {
  // Convert object to array and sort by count
  const languageArray = Object.entries(languages)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 languages

  // Color palette for languages
  const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  ];

  if (languageArray.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Usage</h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No language data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={languageArray}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {languageArray.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb", 
              borderRadius: "8px" 
            }}
            formatter={(value: number) => [`${value} repos`, "Count"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

