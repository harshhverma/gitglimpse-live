// Landing Page Component
// This is the entry point of the application where users enter a GitHub username
// Features: Project branding, description, input field, and analyze button

import React, { useState } from "react";

interface LandingProps {
  onAnalyze: (username: string) => void;
}

export default function Landing({ onAnalyze }: LandingProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please enter a GitHub username");
      return;
    }
    setIsLoading(true);
    // Small delay for better UX
    setTimeout(() => {
      onAnalyze(username.trim());
      setIsLoading(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Git<span className="text-blue-600">Glimpse</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Developer Impact Analyzer
          </p>
          <p className="text-gray-500 max-w-lg mx-auto">
            Analyze GitHub profiles to understand developer contributions, 
            calculate karma scores, and visualize coding impact through 
            commits, pull requests, issues, and repository statistics.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username
              </label>
              <div className="flex gap-3">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., torvalds, octocat"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? "Loading..." : "Analyze Profile"}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter any public GitHub username to get started
              </p>
            </div>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Karma Score</h3>
            <p className="text-sm text-gray-600">
              Calculated using commits, PRs, issues, and repository contributions
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-gray-900 mb-2">Visual Analytics</h3>
            <p className="text-sm text-gray-600">
              Interactive charts showing commits over time, language usage, and more
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Deep Insights</h3>
            <p className="text-sm text-gray-600">
              Comprehensive analysis of developer impact and contributions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

