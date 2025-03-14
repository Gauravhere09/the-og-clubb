
import { Link } from "react-router-dom";
import { FriendSuggestion } from "@/hooks/use-friends";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users, UserCheck, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FriendSuggestionItemProps {
  suggestion: FriendSuggestion;
  isRequested: boolean;
  onSendRequest: () => void;
}

export function FriendSuggestionItem({ 
  suggestion, 
  isRequested, 
  onSendRequest 
}: FriendSuggestionItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${
        suggestion.careerMatch || suggestion.semesterMatch 
          ? 'border-primary/50 bg-primary/5' 
          : 'hover:bg-accent'
      }`}
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
      {isRequested ? (
        <Button size="sm" variant="secondary" disabled>
          <UserCheck className="mr-2 h-4 w-4" />
          Solicitud enviada
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onSendRequest();
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      )}
    </div>
  );
}
