// src/components/ErrorState.tsx
import React from "react";
export default function ErrorState({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="p-6 rounded bg-red-50 text-red-700">
      <div className="font-semibold">Error</div>
      <div className="mt-1 text-sm">{message}</div>
    </div>
  );
}
