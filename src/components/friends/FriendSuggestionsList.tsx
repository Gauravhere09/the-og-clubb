
import { FriendSuggestion } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users } from "lucide-react";

interface FriendSuggestionsListProps {
  suggestions: FriendSuggestion[];
  onSendRequest: (friendId: string) => Promise<void>;
}

export function FriendSuggestionsList({ suggestions, onSendRequest }: FriendSuggestionsListProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Personas que quizá conozcas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={suggestion.avatar_url || undefined} />
                <AvatarFallback>
                  {suggestion.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{suggestion.username}</div>
                {suggestion.mutual_friends_count > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <Users className="inline-block h-3 w-3 mr-1" />
                    {suggestion.mutual_friends_count} amigos en común
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onSendRequest(suggestion.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
