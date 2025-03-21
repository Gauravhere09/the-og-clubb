
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Suggestion {
  id: string;
  username: string;
  avatar_url: string | null;
  mutual_friends?: {
    username: string;
    avatar_url: string | null;
  }[];
}

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
  handleFriendRequest: (userId: string) => Promise<void>;
}

export function SuggestionsSection({ suggestions, handleFriendRequest }: SuggestionsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Personas que quizás conozcas</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground py-3">
            No hay sugerencias disponibles en este momento
          </p>
        ) : (
          <div className="divide-y divide-border">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3">
                <div className="flex items-start gap-3">
                  <Link to={`/profile/${suggestion.id}`} className="shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={suggestion.avatar_url || undefined} />
                      <AvatarFallback>{suggestion.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col">
                    <Link to={`/profile/${suggestion.id}`} className="font-medium">
                      {suggestion.username}
                    </Link>
                    {suggestion.mutual_friends && suggestion.mutual_friends.length > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <div className="flex -space-x-2 mr-1">
                          {suggestion.mutual_friends.slice(0, 2).map((friend, index) => (
                            <Avatar key={index} className="h-4 w-4 border border-background">
                              <AvatarImage src={friend.avatar_url || undefined} />
                              <AvatarFallback>{friend.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {suggestion.mutual_friends.length} {suggestion.mutual_friends.length === 1 ? 'amigo' : 'amigos'} en común
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleFriendRequest(suggestion.id)}
                  className="px-3 py-1 h-8"
                >
                  Añadir
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
