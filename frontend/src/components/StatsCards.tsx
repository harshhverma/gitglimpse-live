// Stats Cards Component
// Displays key statistics: Commits, Pull Requests, Issues, and Repositories
// These are the main metric cards shown on the dashboard

import React from "react";

interface StatsCardsProps {
  stats: {
    commits: number;
    pullRequests: number;
    issuesClosed: number;
    repositories: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Commits",
      value: stats.commits || 0,
      icon: "💻",
      color: "bg-blue-500",
      description: "Total commits",
    },
    {
      label: "Pull Requests",
      value: stats.pullRequests || 0,
      icon: "🔀",
      color: "bg-green-500",
      description: "PRs created",
    },
    {
      label: "Issues Closed",
      value: stats.issuesClosed || 0,
      icon: "✅",
      color: "bg-purple-500",
      description: "Issues resolved",
    },
    {
      label: "Repositories",
      value: stats.repositories || 0,
      icon: "📦",
      color: "bg-orange-500",
      description: "Total repos",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{item.label}</p>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

