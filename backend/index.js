// GitGlimpse Backend Server
// This server provides API endpoints to fetch and analyze GitHub user profiles
// Main endpoint: GET /api/github/:username - Returns profile data with karma score

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

const app = express();

// CORS Configuration - Allow frontend origins
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"] }));
app.use(express.json());

// Firebase Admin SDK initialization (for optional profile caching)
let db = null;
try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
  console.log("✅ Firebase initialized successfully");
} catch (err) {
  console.log("⚠️  Firebase not configured - running without database caching");
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get GitHub API headers with optional authentication token
 */
function getGitHubHeaders() {
  return process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
}

/**
 * Fetch GitHub user profile information
 */
async function fetchGitHubUserProfile(username) {
  const url = `https://api.github.com/users/${username}`;
  try {
    const { data } = await axios.get(url, { headers: getGitHubHeaders() });
    return {
      username: data.login,
      avatar: data.avatar_url,
      bio: data.bio || "No bio available",
      name: data.name || username,
      followers: data.followers || 0,
      following: data.following || 0,
      url: data.html_url,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error("User not found");
    }
    if (err.response?.status === 403) {
      throw new Error("Rate limit exceeded");
    }
    throw err;
  }
}

/**
 * Fetch GitHub user events to analyze contributions
 * Returns: array of events (PushEvent, PullRequestEvent, IssuesEvent, etc.)
 */
async function fetchGitHubEvents(username) {
  const url = `https://api.github.com/users/${username}/events/public?per_page=100`;
  const headers = getGitHubHeaders();
  try {
    const { data } = await axios.get(url, { headers });
    if (!Array.isArray(data)) {
      console.error(`⚠️  Events API returned non-array for ${username}`);
      return [];
    }
    return data;
  } catch (err) {
    if (err.response?.status === 403) {
      console.error(`❌ Rate limit exceeded for events API`);
      throw new Error("Rate limit exceeded");
    }
    if (err.response?.status === 404) {
      console.error(`❌ User ${username} not found`);
      throw new Error("User not found");
    }
    console.error(`❌ Error fetching events for ${username}:`, err.response?.status, err.message);
    throw err; // Re-throw to let caller handle
  }
}

/**
 * Fetch all repositories for a user
 * Returns: array of repos with normalized fields
 */
async function fetchGitHubRepoStats(username) {
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
  const headers = getGitHubHeaders();
  try {
    const { data } = await axios.get(url, { headers });
    
    if (!Array.isArray(data)) {
      console.error(`⚠️  Repos API returned non-array for ${username}`);
      return { totalRepos: 0, totalStars: 0, totalForks: 0, repos: [] };
    }
    
    // Normalize fields
    const repos = data.map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      isFork: !!repo.fork,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      url: repo.html_url,
      description: repo.description || "",
      language: repo.language || null
    }));

    const totalRepos = repos.length;
    const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

    console.log(`📦 Processed ${totalRepos} repos with ${totalStars} total stars`);
    return { totalRepos, totalStars, totalForks, repos };
  } catch (err) {
    if (err.response?.status === 403) {
      console.error(`❌ Rate limit exceeded for repos API`);
      throw new Error("Rate limit exceeded");
    }
    if (err.response?.status === 404) {
      console.error(`❌ User ${username} not found`);
      throw new Error("User not found");
    }
    console.error(`❌ Error fetching repos for ${username}:`, err.response?.status, err.message);
    throw err; // Re-throw to let caller handle
  }
}

/**
 * Count pull requests from events
 * Also tries GitHub search API for more accurate count
 */
async function countPullRequests(username) {
  try {
    // Try search API first (more accurate)
    const searchUrl = `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=1`;
    const { data } = await axios.get(searchUrl, { headers: getGitHubHeaders() });
    if (data.total_count !== undefined) {
      return data.total_count;
    }
  } catch (err) {
    // If rate limited, fallback to events
    if (err.response?.status !== 403) {
      // Fallback to events only if not rate limited
      try {
        const events = await fetchGitHubEvents(username);
        return events.filter(e => e.type === "PullRequestEvent" && e.payload?.action === "opened").length;
      } catch {
        return 0;
      }
    }
  }
  return 0;
}

/**
 * Count issues closed from events
 * Also tries GitHub search API for more accurate count
 */
async function countIssuesClosed(username) {
  try {
    // Try search API first (more accurate)
    const searchUrl = `https://api.github.com/search/issues?q=author:${username}+type:issue+state:closed&per_page=1`;
    const { data } = await axios.get(searchUrl, { headers: getGitHubHeaders() });
    if (data.total_count !== undefined) {
      return data.total_count;
    }
  } catch (err) {
    // If rate limited, fallback to events
    if (err.response?.status !== 403) {
      try {
        const events = await fetchGitHubEvents(username);
        return events.filter(e => e.type === "IssuesEvent" && e.payload?.action === "closed").length;
      } catch {
        return 0;
      }
    }
  }
  return 0;
}

/**
 * Count comments (PR review comments + issue comments)
 */
async function countComments(username) {
  try {
    const events = await fetchGitHubEvents(username);
    let commentCount = 0;
    
    for (const event of events) {
      if (event.type === "PullRequestReviewCommentEvent" || event.type === "IssueCommentEvent") {
        commentCount++;
      }
    }
    
    return commentCount;
  } catch {
    return 0;
  }
}

/**
 * Count documentation improvements from commit messages
 */
function countDocs(events) {
  let docs = 0;
  for (const e of events) {
    if (e.type === "PushEvent") {
      const commits = e.payload?.commits || [];
      for (const c of commits) {
        const msg = (c.message || "").toLowerCase();
        if (msg.includes("readme") || msg.includes("docs") || msg.includes("documentation")) {
          docs++;
        }
      }
    }
  }
  return docs;
}

/**
 * Count total commits from events
 */
function countCommits(events) {
  let commitCount = 0;
  if (events && events.length > 0) {
    events.forEach(event => {
      if (event.type === "PushEvent" && event.payload?.commits) {
        commitCount += event.payload.commits.length;
      }
    });
  }
  return commitCount;
}

/**
 * Calculate language usage from repositories
 */
function calculateLanguages(repos) {
  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  return languages;
}

/**
 * Calculate commits over time (last 12 months)
 */
function calculateCommitsOverTime(events) {
  const monthlyCommits = {};
  const now = new Date();
  
  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyCommits[key] = 0;
  }
  
  // Count commits from events
  if (events && events.length > 0) {
    events.forEach(event => {
      if (event.type === "PushEvent" && event.payload?.commits) {
        const eventDate = new Date(event.created_at);
        const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyCommits[key] !== undefined) {
          monthlyCommits[key] += event.payload.commits.length;
        }
      }
    });
  }
  
  return Object.entries(monthlyCommits).map(([month, commits]) => ({
    month,
    commits,
  }));
}

/**
 * Calculate Karma Score using the specified formula
 * 
 * STEP 1: Normalization references (max values for scaling)
 * STEP 2: Normalize each metric to 0-1
 * STEP 3: Apply weights (sum = 1.0)
 * STEP 4: Calculate final score (0-100)
 * 
 * @param {number} totalRepos - Total repositories
 * @param {number} totalStars - Total stars received
 * @param {number} pr - Pull requests count
 * @param {number} issues - Issues closed count
 * @param {number} comments - Comments count
 * @param {number} totalForks - Total forks count
 * @returns {number} Karma score (0-100, whole number)
 */
function calculateKarmaScore(totalRepos, totalStars, pr, issues, comments, totalForks) {
  // STEP 1: Normalization references (max values)
  const MAX_REPOS = 50;
  const MAX_STARS = 500;
  const MAX_PRS = 200;
  const MAX_ISSUES = 200;
  const MAX_COMMENTS = 300;
  const MAX_FORKS = 200;

  // STEP 2: Normalize each metric to 0-1
  const normalizedRepos = Math.min(totalRepos / MAX_REPOS, 1);
  const normalizedStars = Math.min(totalStars / MAX_STARS, 1);
  const normalizedPRs = Math.min(pr / MAX_PRS, 1);
  const normalizedIssues = Math.min(issues / MAX_ISSUES, 1);
  const normalizedComments = Math.min(comments / MAX_COMMENTS, 1);
  const normalizedForks = Math.min(totalForks / MAX_FORKS, 1);

  // STEP 3: Weights (sum = 1.0)
  // Updated weights to give more recognition to repository creators
  const weightRepos = 0.30;      // 30% - Repositories show project creation and active development (increased from 20%)
  const weightPRs = 0.20;        // 20% - PRs show collaboration (reduced from 25%)
  const weightIssues = 0.15;     // 15% - Issues show problem-solving (reduced from 20%)
  const weightComments = 0.10;   // 10% - Comments show engagement (unchanged)
  const weightStars = 0.15;       // 15% - Stars show recognition (unchanged)
  const weightForks = 0.10;       // 10% - Forks show project usage (unchanged)

  // STEP 4: Calculate weighted score
  const rawScore =
    (normalizedRepos * weightRepos) +
    (normalizedPRs * weightPRs) +
    (normalizedIssues * weightIssues) +
    (normalizedComments * weightComments) +
    (normalizedStars * weightStars) +
    (normalizedForks * weightForks);

  // Convert to percentage (0-100) and round to whole number
  let karmaScore = Math.round(rawScore * 100);

  // Safety checks: ensure score is between 0 and 100
  karmaScore = Math.max(0, Math.min(100, karmaScore));

  return karmaScore;
}

/**
 * Generate summary text in the original style
 * Factual and academic, not marketing language
 */
function generateSummary(username, breakdown) {
  const { pr, issues, docs, comments, forks, totalRepos, totalStars } = breakdown;
  
  let summary = `${username} has contributed ${pr} pull requests, ${issues} issues, and ${comments} comments. `;
  
  if (docs > 0) {
    summary += `They've improved documentation ${docs} times `;
  }
  
  if (forks > 0) {
    summary += `and forked ${forks} repositories. `;
  }
  
  summary += `They've built ${totalRepos} public repositories with ${totalStars} stars in total — showing consistent effort and community impact.`;
  
  return summary;
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check route
app.get("/", (_, res) => {
  res.json({ message: "GitGlimpse backend running", status: "ok" });
});

/**
 * MAIN ENDPOINT: GET /api/github/:username
 * Returns profile data transformed for frontend compatibility
 */
app.get("/api/github/:username", async (req, res) => {
  const username = req.params.username;
  const forceRefresh = req.query.refresh === 'true';
  
  // Validate username
  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }

  // Check for cached data first (helps with rate limits) - skip if force refresh
  let cachedData = null;
  if (db && !forceRefresh) {
    try {
      const snap = await db.collection("profiles").doc(username).get();
      if (snap.exists) {
        cachedData = snap.data();
        // Use cached data if it's less than 5 minutes old (shorter cache for testing)
        const cacheAge = Date.now() - new Date(cachedData.updatedAt).getTime();
        
        // Check if cached data has meaningful values (not all zeros)
        const hasValidData = cachedData.karmaScore > 0 || 
                            (cachedData.breakdown && cachedData.breakdown.totalRepos > 0) ||
                            (cachedData.repoStats && cachedData.repoStats.totalRepos > 0);
        
        if (cacheAge < 300000 && hasValidData) { // 5 minutes and has valid data
          console.log(`✅ Using cached data for ${username} (age: ${Math.round(cacheAge / 60000)} minutes, karma: ${cachedData.karmaScore})`);
          
          // If we have frontend format cached, use it directly
          if (cachedData.frontendFormat) {
            // Try to get fresh profile data (just profile, not all data)
            try {
              const freshProfile = await fetchGitHubUserProfile(username);
              const result = { ...cachedData.frontendFormat };
              result.profile = freshProfile; // Use fresh profile data
              return res.json(result);
            } catch (err) {
              // If profile fetch fails, use cached frontend format as-is
              console.log(`⚠️  Could not fetch fresh profile, using cached: ${err.message}`);
              return res.json(cachedData.frontendFormat);
            }
          } else {
            // Transform old format to frontend format
            try {
              const freshProfile = await fetchGitHubUserProfile(username);
              const transformed = transformToFrontendFormat(cachedData, username);
              transformed.profile = freshProfile; // Use fresh profile data
              return res.json(transformed);
            } catch (err) {
              // If profile fetch fails, use cached data with transformed profile
              console.log(`⚠️  Could not fetch fresh profile, using cached: ${err.message}`);
              return res.json(transformToFrontendFormat(cachedData, username));
            }
          }
        } else {
          if (!hasValidData) {
            console.log(`⚠️  Cached data for ${username} has all zeros, fetching fresh data`);
          } else {
            console.log(`⏰ Cache expired for ${username}, fetching fresh data`);
          }
        }
      }
    } catch (err) {
      console.log("⚠️  Could not read cache:", err.message);
    }
  } else if (forceRefresh) {
    console.log(`🔄 Force refresh requested for ${username}`);
  }

  try {
    // Fetch user profile first
    let profileData;
    try {
      profileData = await fetchGitHubUserProfile(username);
    } catch (err) {
      if (err.message === "Rate limit exceeded") {
        // Try to use cached data even if old
        if (cachedData) {
          console.log(`⚠️  Rate limited, using cached data for ${username}`);
          return res.json(transformToFrontendFormat(cachedData, username));
        }
        return res.status(429).json({ 
          error: "GitHub API rate limit exceeded. Please try again later.",
          message: "Rate limit exceeded"
        });
      }
      throw err;
    }

    // Fetch data in parallel - with proper error handling
    console.log(`📡 Fetching GitHub data for ${username}...`);
    
    let eventsData = [];
    let repoStatsData = { totalRepos: 0, totalStars: 0, totalForks: 0, repos: [] };
    
    try {
      eventsData = await fetchGitHubEvents(username);
      console.log(`✅ Fetched ${eventsData.length} events`);
    } catch (err) {
      console.error(`❌ Error fetching events: ${err.message}`);
      if (err.message !== "Rate limit exceeded") {
        // Only use empty array if not rate limited
        eventsData = [];
      } else {
        throw err; // Re-throw rate limit errors
      }
    }

    try {
      repoStatsData = await fetchGitHubRepoStats(username);
      console.log(`✅ Fetched ${repoStatsData.totalRepos} repositories, ${repoStatsData.totalStars} stars`);
    } catch (err) {
      console.error(`❌ Error fetching repos: ${err.message}`);
      if (err.message !== "Rate limit exceeded") {
        repoStatsData = { totalRepos: 0, totalStars: 0, totalForks: 0, repos: [] };
      } else {
        throw err; // Re-throw rate limit errors
      }
    }

    // Count contributions (with proper error handling and logging)
    let prCount = 0, issuesCount = 0, commentsCount = 0;
    
    try {
      prCount = await countPullRequests(username);
      console.log(`📊 Pull Requests: ${prCount}`);
    } catch (err) {
      console.error(`❌ Error counting PRs: ${err.message}`);
      prCount = 0;
    }

    try {
      issuesCount = await countIssuesClosed(username);
      console.log(`📊 Issues Closed: ${issuesCount}`);
    } catch (err) {
      console.error(`❌ Error counting issues: ${err.message}`);
      issuesCount = 0;
    }

    try {
      commentsCount = await countComments(username);
      console.log(`📊 Comments: ${commentsCount}`);
    } catch (err) {
      console.error(`❌ Error counting comments: ${err.message}`);
      commentsCount = 0;
    }

    const docsCount = countDocs(eventsData);
    const forksCount = eventsData.filter(e => e.type === "ForkEvent").length;
    const commitsCount = countCommits(eventsData);

    console.log(`📊 Final counts - Commits: ${commitsCount}, PRs: ${prCount}, Issues: ${issuesCount}, Comments: ${commentsCount}`);
    console.log(`📊 Repos: ${repoStatsData.totalRepos}, Stars: ${repoStatsData.totalStars}, Forks: ${repoStatsData.totalForks}`);

    // Build breakdown object
    const breakdown = {
      pr: prCount,
      issues: issuesCount,
      docs: docsCount,
      comments: commentsCount,
      forks: forksCount,
      totalRepos: repoStatsData.totalRepos,
      totalStars: repoStatsData.totalStars,
      totalForks: repoStatsData.totalForks,
    };

    // Calculate karma score
    const karmaScore = calculateKarmaScore(
      breakdown.totalRepos,
      breakdown.totalStars,
      breakdown.pr,
      breakdown.issues,
      breakdown.comments,
      breakdown.totalForks
    );

    console.log(`⭐ Calculated Karma Score: ${karmaScore}`);

    // Generate summary
    const summary = generateSummary(username, breakdown);

    // Calculate derived data for frontend
    const languages = calculateLanguages(repoStatsData.repos || []);
    const commitsOverTime = calculateCommitsOverTime(eventsData);

    // Build response in frontend-compatible format
    const response = {
      profile: profileData,
      stats: {
        commits: commitsCount,
        pullRequests: prCount,
        issuesClosed: issuesCount,
        repositories: repoStatsData.totalRepos,
      },
      karmaScore: karmaScore,
      repos: (repoStatsData.repos || []).slice(0, 20).map(r => ({
        name: r.name,
        stars: r.stars || 0,
        forks: r.forks || 0,
        language: r.language || null,
        description: r.description || "",
        url: r.url,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        isFork: r.isFork || false,
      })),
      languages: languages,
      commitsOverTime: commitsOverTime,
      prsVsIssues: {
        pullRequests: prCount,
        issues: issuesCount,
      },
      summary: summary,
      updatedAt: new Date().toISOString(),
    };

    // Cache the response (store both old format for compatibility and new format)
    if (db) {
      try {
        await db.collection("profiles").doc(username).set({
          username,
          karmaScore,
          breakdown,
          summary,
          repoStats: {
            totalRepos: repoStatsData.totalRepos,
            totalStars: repoStatsData.totalStars,
            totalForks: repoStatsData.totalForks,
            repos: repoStatsData.repos || []
          },
          topRepositories: (repoStatsData.repos || [])
            .slice()
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .slice(0, 8)
            .map(r => ({
              name: r.name,
              description: r.description || '',
              stars: r.stars || 0,
              forks: r.forks || 0,
              createdDate: r.createdAt,
              url: r.url,
              language: r.language || null
            })),
          // Also store frontend format for faster retrieval
          frontendFormat: response,
          updatedAt: response.updatedAt,
        }, { merge: true });
        console.log(`💾 Cached profile data for ${username}`);
      } catch (err) {
        console.log("⚠️  Could not cache profile:", err.message);
      }
    }

    res.json(response);
  } catch (err) {
    // Handle errors gracefully
    if (err.message === "User not found") {
      return res.status(404).json({ 
        error: "User not found",
        message: "The GitHub username does not exist."
      });
    }

    if (err.message === "Rate limit exceeded" || err.response?.status === 403) {
      // Try cached data as last resort
      if (cachedData) {
        console.log(`⚠️  Rate limited, using cached data for ${username}`);
        return res.json(transformToFrontendFormat(cachedData, username));
      }
      return res.status(429).json({ 
        error: "GitHub API rate limit exceeded. Please try again later.",
        message: "Rate limit exceeded"
      });
    }

    console.error(`Error fetching data for ${username}:`, err.message);
    return res.status(500).json({ 
      error: "Failed to fetch GitHub profile",
      message: err.message 
    });
  }
});

/**
 * Transform cached data to frontend format
 */
function transformToFrontendFormat(cachedData, username) {
  // Extract repos from either repoStats.repos or topRepositories
  const repos = cachedData.repoStats?.repos || cachedData.topRepositories || [];
  
  // Calculate languages from repos
  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Build commits over time (empty for cached data)
  const commitsOverTime = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1);
    return {
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      commits: 0,
    };
  });

  return {
    profile: {
      username: cachedData.username || username,
      avatar: `https://github.com/${username}.png`,
      bio: "Profile data from cache - refresh to get latest",
      name: cachedData.username || username,
      followers: 0,
      following: 0,
      url: `https://github.com/${username}`,
    },
    stats: {
      commits: 0, // Not stored in cache
      pullRequests: cachedData.breakdown?.pr || 0,
      issuesClosed: cachedData.breakdown?.issues || 0,
      repositories: cachedData.repoStats?.totalRepos || cachedData.breakdown?.totalRepos || 0,
    },
    karmaScore: cachedData.karmaScore || 0,
    repos: repos.slice(0, 20).map(r => ({
      name: r.name,
      stars: r.stars || 0,
      forks: r.forks || 0,
      language: r.language || null,
      description: r.description || "",
      url: r.url,
      createdAt: r.createdAt || r.createdDate || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString(),
      isFork: r.isFork || false,
    })),
    languages: languages,
    commitsOverTime: commitsOverTime,
    prsVsIssues: {
      pullRequests: cachedData.breakdown?.pr || 0,
      issues: cachedData.breakdown?.issues || 0,
    },
    summary: cachedData.summary || `${username} has contributed ${cachedData.breakdown?.pr || 0} pull requests, ${cachedData.breakdown?.issues || 0} issues, and ${cachedData.breakdown?.comments || 0} comments. They've built ${cachedData.repoStats?.totalRepos || 0} public repositories with ${cachedData.repoStats?.totalStars || 0} stars in total — showing consistent effort and community impact.`,
    updatedAt: cachedData.updatedAt || new Date().toISOString(),
  };
}

// Legacy endpoints for backward compatibility
app.post("/api/analyze", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    
    // Redirect to main endpoint
    const response = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/github/${username}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "analysis_failed", details: err.message });
  }
});

app.get("/api/public/:username", async (req, res) => {
  try {
    if (!db) {
      return res.status(404).json({ error: "Database not configured" });
    }
    const snap = await db.collection("profiles").doc(req.params.username).get();
    if (!snap.exists) return res.status(404).json({ error: "not_found" });
    res.json(snap.data());
  } catch (err) {
    res.status(500).json({ error: "public_fetch_failed", details: err.message });
  }
});

// Clear cache for a user (for testing)
app.delete("/api/cache/:username", async (req, res) => {
  try {
    if (!db) {
      return res.status(400).json({ error: "Database not configured" });
    }
    await db.collection("profiles").doc(req.params.username).delete();
    console.log(`🗑️  Cleared cache for ${req.params.username}`);
    res.json({ message: `Cache cleared for ${req.params.username}` });
  } catch (err) {
    res.status(500).json({ error: "cache_clear_failed", details: err.message });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 GitGlimpse backend running at http://localhost:${port}`);
  console.log(`📡 Main endpoint: GET /api/github/:username`);
  if (!process.env.GITHUB_TOKEN) {
    console.log("⚠️  No GITHUB_TOKEN found - rate limit will be 60 requests/hour");
  }
});
