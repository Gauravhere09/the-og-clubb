
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { FriendSuggestion } from "@/types/friends";

interface NotificationsSuggestionsProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationsSuggestions({ 
  suggestions, 
  onDismissSuggestion, 
  setOpen 
}: NotificationsSuggestionsProps) {
  if (suggestions.length === 0) return null;
  
  return (
    <>
      <div className="p-2 bg-muted/50 text-sm font-medium text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Sugerencias para ti</span>
        </div>
      </div>
      
      {suggestions.slice(0, 5).map((suggestion) => (
        <div key={suggestion.id} className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${suggestion.id}`} onClick={() => setOpen(false)}>
              <Avatar>
                <AvatarImage src={suggestion.avatar_url || undefined} />
                <AvatarFallback>{suggestion.username[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link 
                to={`/profile/${suggestion.id}`}
                className="font-medium hover:underline"
                onClick={() => setOpen(false)}
              >
                {suggestion.username}
              </Link>
              {suggestion.mutual_friends_count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {suggestion.mutual_friends_count} amigos en común
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <FollowButton targetUserId={suggestion.id} size="sm" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onDismissSuggestion(suggestion.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      <div className="p-2 text-center">
        <Link 
          to="/friends" 
          className="text-sm text-blue-500 hover:underline"
          onClick={() => setOpen(false)}
        >
          Ver todas las sugerencias
        </Link>
      </div>
    </>
  );
}
