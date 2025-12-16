// AI Summary Section Component
// Displays an AI-generated summary of the developer's impact and contributions
// Currently uses a static text placeholder, but can be enhanced with actual AI integration

import React from "react";

interface SummarySectionProps {
  summary?: string;
  breakdown?: Record<string, number>;
}

export default function SummarySection({
  summary,
  breakdown
}: SummarySectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">🤖</div>
        <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
      </div>
      
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {summary || "No summary available. This section provides an AI-generated analysis of the developer's impact and contributions."}
      </p>

      {/* Breakdown stats */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(breakdown)
              .filter(([key]) => !['totalRepos', 'totalStars', 'totalForks'].includes(key))
              .slice(0, 4)
              .map(([key, value]) => (
                <div key={key} className="text-xs">
                  <div className="font-semibold text-gray-900">{value}</div>
                  <div className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
