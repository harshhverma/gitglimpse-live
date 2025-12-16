// src/components/LoadingState.tsx
import React from "react";
export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="p-6 text-center">
      <div className="text-sm text-gray-500">{message}</div>
    </div>
  );
}
