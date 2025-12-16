// Dashboard Page Component
// Main dashboard displaying GitHub profile analysis
// Includes: Profile Card, Karma Score, Stats Cards, Charts, and AI Summary

import React, { useEffect, useState } from "react";
import { fetchGitHubProfile } from "../services/api";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ProfileCard from "../components/ProfileCard";
import KarmaCard from "../components/KarmaCard";
import StatsCards from "../components/StatsCards";
import SummarySection from "../components/SummarySection";
import CommitsOverTimeChart from "../components/CommitsOverTimeChart";
import PRsVsIssuesChart from "../components/PRsVsIssuesChart";
import LanguageUsageChart from "../components/LanguageUsageChart";
import RepositoryTable from "../components/RepositoryTable";

interface GitHubProfile {
  profile: {
    username: string;
    avatar: string;
    bio: string;
    name?: string;
    followers?: number;
    following?: number;
    url: string;
  };
  stats: {
    commits: number;
    pullRequests: number;
    issuesClosed: number;
    repositories: number;
  };
  karmaScore: number;
  repos: Array<{
    name: string;
    stars: number;
    forks: number;
    language: string | null;
    description: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    isFork: boolean;
  }>;
  languages: Record<string, number>;
  commitsOverTime: Array<{ month: string; commits: number }>;
  prsVsIssues: {
    pullRequests: number;
    issues: number;
  };
  summary: string;
  updatedAt: string;
}

interface DashboardProps {
  username: string;
  onBack: () => void;
}

export default function Dashboard({ username, onBack }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGitHubProfile(username);
        if (!mounted) return;
        setProfile(data);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) {
    return <LoadingState message="Analyzing GitHub profile..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorState message={error} />
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center text-gray-500">No profile data available</div>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">GitGlimpse Dashboard</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Profile Card */}
        <ProfileCard profile={profile.profile} />

        {/* Karma Score - Large Highlighted Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <KarmaCard score={profile.karmaScore} />
          </div>
          <div className="lg:col-span-2">
            <SummarySection summary={profile.summary} breakdown={profile.stats} />
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={profile.stats} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CommitsOverTimeChart data={profile.commitsOverTime} />
          <PRsVsIssuesChart data={profile.prsVsIssues} />
        </div>

        {/* Language Usage Chart */}
        <LanguageUsageChart languages={profile.languages} />

        {/* Repository Table */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Repositories</h2>
          <RepositoryTable repos={profile.repos.slice(0, 10)} />
        </div>

        {/* Footer with last updated */}
        <div className="text-center text-sm text-gray-500 py-4">
          Last updated: {new Date(profile.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
