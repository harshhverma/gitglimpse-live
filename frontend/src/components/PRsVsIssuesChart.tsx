// PRs vs Issues Pie Chart Component
// Displays a pie chart comparing Pull Requests and Issues
// Uses Recharts library for visualization

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PRsVsIssuesChartProps {
  data: {
    pullRequests: number;
    issues: number;
  };
}

export default function PRsVsIssuesChart({ data }: PRsVsIssuesChartProps) {
  const chartData = [
    { name: "Pull Requests", value: data.pullRequests || 0 },
    { name: "Issues", value: data.issues || 0 },
  ];

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PRs vs Issues</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#fff", 
              border: "1px solid #e5e7eb", 
              borderRadius: "8px" 
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

