
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, UserCheck, Briefcase, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { FriendSuggestion } from "@/types/friends";

interface FriendSuggestionItemProps {
  suggestion: FriendSuggestion;
  onSendRequest: (friendId: string) => Promise<void>;
  hasExistingRequest: boolean;
}

export function FriendSuggestionItem({ 
  suggestion, 
  onSendRequest, 
  hasExistingRequest 
}: FriendSuggestionItemProps) {
  const [isPending, setIsPending] = useState(hasExistingRequest);
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending friend request
  const handleSendRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isPending) return;
    
    try {
      setIsLoading(true);
      await onSendRequest(suggestion.id);
      setIsPending(true);
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${suggestion.careerMatch || suggestion.semesterMatch ? 'border-primary/50 bg-primary/5' : 'hover:bg-accent'}`}
    >
      <Link
        to={`/profile/${suggestion.id}`}
        className="flex items-center gap-3"
      >
        <Avatar>
          <AvatarImage src={suggestion.avatar_url || undefined} />
          <AvatarFallback>
            {suggestion.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="font-medium">{suggestion.username}</div>
          <div className="flex flex-wrap gap-2">
            {suggestion.career && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Briefcase className="inline-block h-3 w-3 mr-1" />
                <span className={suggestion.careerMatch ? "font-medium text-primary" : ""}>
                  {suggestion.career}
                  {suggestion.careerMatch && 
                    <Badge variant="outline" className="ml-1 bg-primary/10 text-primary text-[10px] py-0 h-4">
                      Coincide
                    </Badge>
                  }
                </span>
              </div>
            )}
            {suggestion.semester && (
              <div className="flex items-center text-xs text-muted-foreground">
                <GraduationCap className="inline-block h-3 w-3 mr-1" />
                <span className={suggestion.semesterMatch ? "font-medium text-primary" : ""}>
                  Semestre {suggestion.semester}
                  {suggestion.semesterMatch && 
                    <Badge variant="outline" className="ml-1 bg-primary/10 text-primary text-[10px] py-0 h-4">
                      Coincide
                    </Badge>
                  }
                </span>
              </div>
            )}
          </div>
          {suggestion.mutual_friends_count > 0 && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Users className="inline-block h-3 w-3 mr-1" />
              {suggestion.mutual_friends_count} amigos en común
            </div>
          )}
        </div>
      </Link>
      {isPending ? (
        <Button size="sm" variant="secondary" disabled>
          <UserCheck className="mr-2 h-4 w-4" />
          Solicitud enviada
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleSendRequest}
          disabled={isLoading}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      )}
    </div>
  );
}
