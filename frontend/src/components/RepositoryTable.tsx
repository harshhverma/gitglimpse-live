// src/components/RepositoryTable.tsx
import React from "react";

export default function RepositoryTable({ repos = [] }: { repos?: any[] }) {
  if (!repos || repos.length === 0) {
    return (
      <div className="p-4 rounded-xl shadow-sm bg-white">
        <div className="text-sm text-gray-500">No top repositories to show</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Repository</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-500">Language</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Stars</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Forks</th>
            <th className="px-4 py-2 text-xs font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {repos.map((r: any) => (
            <tr key={r.url || r.name}>
              <td className="px-4 py-2">
                <a className="font-medium text-sm text-blue-600 hover:underline" href={r.url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
                <div className="text-xs text-gray-500">{r.description}</div>
              </td>
              <td className="px-4 py-2 text-sm">
                {r.language ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {r.language}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-2 text-right text-sm">{r.stars ?? r.stargazers_count ?? 0}</td>
              <td className="px-4 py-2 text-right text-sm">{r.forks ?? r.forks_count ?? 0}</td>
              <td className="px-4 py-2 text-sm">{(r.createdDate || r.createdAt) ? new Date(r.createdDate || r.createdAt).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
