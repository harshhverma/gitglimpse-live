// Karma Card Component
// Displays the calculated Karma Score - the main highlight of the dashboard
// Karma Score is calculated using: repos (30%), PRs (20%), issues (15%), comments (10%), stars (15%), forks (10%)
// All metrics are normalized and the final score is a whole number between 0-100

import React from "react";

interface KarmaCardProps {
  score: number;
}

export default function KarmaCard({ score }: KarmaCardProps) {
  // Ensure score is a whole number (backend should already provide this, but safety check)
  const karmaScore = Math.round(score);
  
  // Determine level based on score
  const getLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 80) {
      return { level: "Elite", color: "text-purple-600", description: "Top-tier contributor" };
    } else if (score >= 60) {
      return { level: "Expert", color: "text-blue-600", description: "Highly active developer" };
    } else if (score >= 40) {
      return { level: "Advanced", color: "text-green-600", description: "Active contributor" };
    } else if (score >= 20) {
      return { level: "Contributor", color: "text-yellow-600", description: "Regular contributor" };
    } else {
      return { level: "Beginner", color: "text-gray-600", description: "Getting started" };
    }
  };

  const { level, color, description } = getLevel(karmaScore);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-xl p-8 text-white">
      <div className="text-sm font-medium text-blue-100 mb-2">Karma Score</div>
      <div className="flex items-baseline gap-3 mb-2">
        <div className="text-6xl font-extrabold">{karmaScore}</div>
        <div className="text-2xl font-semibold text-blue-100">/ 100</div>
      </div>
      <div className={`text-lg font-semibold ${color === "text-purple-600" ? "text-purple-200" : color === "text-blue-600" ? "text-blue-200" : "text-white"} mb-1`}>
        {level}
      </div>
      <div className="text-sm text-blue-100">{description}</div>
      
      {/* Score breakdown explanation */}
      <div className="mt-6 pt-6 border-t border-blue-400/30">
        <p className="text-xs text-blue-100 font-medium mb-1">
          Calculated based on GitHub activity
        </p>
        <p className="text-xs text-blue-200">
          Factors: Repos (30%), PRs (20%), Issues (15%), Comments (10%), Stars (15%), Forks (10%)
        </p>
      </div>
    </div>
  );
}
