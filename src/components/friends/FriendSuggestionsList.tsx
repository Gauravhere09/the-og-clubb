
import { useState, useEffect } from "react";
import { FriendSuggestion } from "@/hooks/use-friends";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users, UserCheck, Briefcase, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface FriendSuggestionsListProps {
  suggestions: FriendSuggestion[];
  onSendRequest: (friendId: string) => Promise<void>;
}

export function FriendSuggestionsList({ suggestions, onSendRequest }: FriendSuggestionsListProps) {
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});

  const checkExistingRequest = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('friendships')
      .select('status')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .eq('status', 'pending')
      .maybeSingle();

    return data !== null;
  };

  useEffect(() => {
    const loadExistingRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const requests = {};
      for (const suggestion of suggestions) {
        const hasRequest = await checkExistingRequest(suggestion.id);
        if (hasRequest) {
          requests[suggestion.id] = true;
        }
      }
      setRequestedFriends(requests);
    };

    loadExistingRequests();
  }, [suggestions]);

  const handleSendRequest = async (friendId: string) => {
    try {
      // Verificar si ya existe una solicitud pendiente
      const hasExistingRequest = await checkExistingRequest(friendId);
      if (hasExistingRequest) {
        setRequestedFriends(prev => ({ ...prev, [friendId]: true }));
        return;
      }

      await onSendRequest(friendId);
      setRequestedFriends(prev => ({ ...prev, [friendId]: true }));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Personas que quizá conozcas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
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
            {requestedFriends[suggestion.id] ? (
              <Button size="sm" variant="secondary" disabled>
                <UserCheck className="mr-2 h-4 w-4" />
                Solicitud enviada
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  handleSendRequest(suggestion.id);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
