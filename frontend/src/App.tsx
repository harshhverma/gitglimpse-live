// Main App Component
// Handles routing between Landing Page and Dashboard
// This is the root component that manages the application state

import React, { useState } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

export default function App() {
  // State to track current page and username
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">("landing");
  const [username, setUsername] = useState<string>("");

  // Handle analyze action from landing page
  const handleAnalyze = (newUsername: string) => {
    setUsername(newUsername);
    setCurrentPage("dashboard");
  };

  // Handle back action from dashboard
  const handleBack = () => {
    setCurrentPage("landing");
    setUsername("");
  };

  // Render appropriate page based on state
  return (
    <div className="App">
      {currentPage === "landing" ? (
        <Landing onAnalyze={handleAnalyze} />
      ) : (
        <Dashboard username={username} onBack={handleBack} />
      )}
    </div>
  );
}
