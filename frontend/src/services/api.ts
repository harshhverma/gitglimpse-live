// API Service
// Handles all API calls to the backend server
// Main endpoint: GET /api/github/:username

import axios from "axios";

// API base URL - defaults to localhost:5000 for development
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

/**
 * Fetch GitHub profile data from the backend
 * This is the main API call that returns complete profile information
 * @param username - GitHub username to analyze
 * @returns Complete profile data including stats, karma score, repos, charts data, etc.
 */
export async function fetchGitHubProfile(username: string) {
  try {
    const { data } = await axios.get(`${API_BASE}/github/${encodeURIComponent(username)}`);
    return data;
  } catch (err: any) {
    // Handle different error types
    if (err?.response?.status === 404) {
      throw new Error("User not found. Please check the username and try again.");
    }
    if (err?.response?.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
    throw new Error(err?.response?.data?.error || err.message || "Failed to fetch GitHub profile");
  }
}

/**
 * Legacy function for backward compatibility
 * Fetches public profile from Firestore cache
 */
export async function fetchPublicProfile(username: string) {
  try {
    const { data } = await axios.get(`${API_BASE}/public/${encodeURIComponent(username)}`);
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const e = new Error("not_found");
      (e as any).status = 404;
      throw e;
    }
    throw new Error(err?.response?.data?.error || err.message || "Failed to fetch public profile");
  }
}

/**
 * Legacy function for backward compatibility
 * Analyzes and saves profile to Firestore
 */
export async function analyzeAndSaveProfile(username: string) {
  try {
    const { data } = await axios.post(`${API_BASE}/analyze`, { username });
    return data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || err.message || "Failed to analyze profile");
  }
}
