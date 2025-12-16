// Commits Over Time Chart Component
// Displays a line/bar chart showing commit activity over the last 12 months
// Uses Recharts library for visualization

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface CommitsOverTimeChartProps {
  data: Array<{ month: string; commits: number }>;
}

export default function CommitsOverTimeChart({ data }: CommitsOverTimeChartProps) {
  // Format month labels for better readability
  const formattedData = data.map(item => ({
    ...item,
    monthLabel: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Commits Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="monthLabel" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb", 
              borderRadius: "8px" 
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="commits" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Commits"
            dot={{ fill: "#3b82f6", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

