// Profile Card Component
// Displays GitHub user profile information: avatar, username, bio, and basic stats
// This is the main profile header card on the dashboard

import React from "react";

interface ProfileCardProps {
  profile: {
    username: string;
    avatar: string;
    bio: string;
    name?: string;
    followers?: number;
    following?: number;
    url: string;
  };
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <img
          src={profile.avatar}
          alt={`${profile.username}'s avatar`}
          className="w-24 h-24 rounded-full border-4 border-blue-100"
        />
        
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.name || profile.username}
            </h2>
            {profile.name && (
              <span className="text-gray-500 text-lg">@{profile.username}</span>
            )}
          </div>
          
          {/* Bio */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {profile.bio || "No bio available"}
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 text-sm">
            {profile.followers !== undefined && (
              <div>
                <span className="font-semibold text-gray-900">{profile.followers}</span>
                <span className="text-gray-500 ml-1">followers</span>
              </div>
            )}
            {profile.following !== undefined && (
              <div>
                <span className="font-semibold text-gray-900">{profile.following}</span>
                <span className="text-gray-500 ml-1">following</span>
              </div>
            )}
          </div>
          
          {/* GitHub Link */}
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}

