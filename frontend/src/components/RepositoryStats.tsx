// src/components/RepositoryStats.tsx
import React from "react";

export default function RepositoryStats({ stats }: { stats?: any }) {
  const totals = [
    { label: "Repositories", value: stats?.totalRepos ?? 0 },
    { label: "Stars", value: stats?.totalStars ?? 0 },
    { label: "Forks", value: stats?.totalForks ?? 0 }
  ];
  return (
    <div className="p-4 rounded-xl shadow-sm bg-white">
      <div className="text-sm font-medium text-gray-700">Repository Stats</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {totals.map((t) => (
          <div key={t.label} className="text-center">
            <div className="text-lg font-bold">{t.value}</div>
            <div className="text-xs text-gray-500">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
