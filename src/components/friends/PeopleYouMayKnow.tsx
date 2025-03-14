
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getFriendSuggestions } from "@/lib/api/friends/suggestions";
import { FriendSuggestion } from "@/types/friends";
import { PeopleYouMayKnowCard } from "./PeopleYouMayKnowCard";
import { PeopleYouMayKnowSkeleton } from "./PeopleYouMayKnowSkeleton";
import { useFriendRequests } from "@/hooks/use-friend-requests";

export function PeopleYouMayKnow() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { requestedFriends, dismissedFriends, handleSendRequest, handleDismiss } = useFriendRequests();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await getFriendSuggestions();
        // Limit to suggestions for the feed widget
        setSuggestions(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Filter out dismissed suggestions
  const visibleSuggestions = suggestions.filter(
    sugg => !dismissedFriends[sugg.id]
  );

  // No mostrar el componente si no hay sugerencias visibles
  if (visibleSuggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personas que quizá conozcas</CardTitle>
          </div>
          <Link to="/friends" className="text-sm text-primary flex items-center">
            Ver todo <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-2">
        {loading ? (
          <PeopleYouMayKnowSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visibleSuggestions.slice(0, 6).map((suggestion) => (
              <PeopleYouMayKnowCard
                key={suggestion.id}
                suggestion={suggestion}
                isRequested={requestedFriends[suggestion.id] || false}
                onSendRequest={handleSendRequest}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
