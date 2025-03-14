
import React from "react";

export function PeopleYouMayKnowSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative rounded-lg p-3 border animate-pulse">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-16 w-16 rounded-full bg-muted"></div>
            <div className="h-4 w-20 bg-muted rounded"></div>
            <div className="h-3 w-16 bg-muted rounded"></div>
            <div className="h-8 w-full bg-muted rounded mt-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
