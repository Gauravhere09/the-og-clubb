
import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { FriendSuggestion } from "@/types/friends";

interface PeopleYouMayKnowCardProps {
  suggestion: FriendSuggestion;
  isRequested: boolean;
  onSendRequest: (friendId: string) => void;
  onDismiss: (friendId: string) => void;
}

export function PeopleYouMayKnowCard({
  suggestion,
  isRequested,
  onSendRequest,
  onDismiss
}: PeopleYouMayKnowCardProps) {
  return (
    <div 
      key={suggestion.id}
      className="relative rounded-lg p-3 border hover:bg-muted/30 transition-colors"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1 right-1 h-6 w-6 p-1 opacity-70 hover:opacity-100 z-10"
        onClick={() => onDismiss(suggestion.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center text-center gap-2">
        <Link to={`/profile/${suggestion.id}`}>
          <Avatar className="h-16 w-16">
            <AvatarImage src={suggestion.avatar_url || undefined} />
            <AvatarFallback>
              {suggestion.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${suggestion.id}`} className="font-medium text-sm hover:underline line-clamp-1">
            {suggestion.username}
          </Link>
          
          {suggestion.mutual_friends_count > 0 && (
            <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
              <span className="line-clamp-1">
                {suggestion.mutual_friends_count} {suggestion.mutual_friends_count === 1 ? 'amigo' : 'amigos'} en común
              </span>
            </div>
          )}
        </div>
        
        <Button 
          variant={isRequested ? "secondary" : "default"}
          size="sm" 
          className="w-full mt-1"
          disabled={isRequested}
          onClick={() => onSendRequest(suggestion.id)}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          {isRequested ? "Enviada" : "Añadir amigo"}
        </Button>
      </div>
    </div>
  );
}
