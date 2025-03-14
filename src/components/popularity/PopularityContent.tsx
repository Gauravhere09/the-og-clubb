import React from "react";
import { PopularUserProfile } from "@/hooks/use-popular-users";

export interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
  className?: string; // Add className as an optional prop
}

export function PopularityContent({ users, onProfileClick, className }: PopularityContentProps) {
  return (
    <div className={className}>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center space-x-4 py-2 px-4 rounded-md hover:bg-secondary cursor-pointer"
          onClick={() => onProfileClick(user.id)}
        >
          <img
            src={user.avatar_url || "/placeholder-avatar.jpg"}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {user.followers_count} seguidores
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
