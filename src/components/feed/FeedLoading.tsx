
import React from "react";
import { Card } from "@/components/ui/card";

export function FeedLoading() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    </div>
  );
}
