
import { Card } from "@/components/ui/card";
import { FriendSuggestion } from "@/hooks/use-friends";
import { FriendSuggestionItem } from "./FriendSuggestionItem";
import { useFriendSuggestions } from "@/hooks/use-friend-suggestions";

interface FriendSuggestionsListProps {
  suggestions: FriendSuggestion[];
  onSendRequest: (friendId: string) => Promise<void>;
}

export function FriendSuggestionsList({ suggestions, onSendRequest }: FriendSuggestionsListProps) {
  const { requestedFriends, handleSendRequest } = useFriendSuggestions(suggestions);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Personas que quizá conozcas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <FriendSuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            isRequested={!!requestedFriends[suggestion.id]}
            onSendRequest={() => handleSendRequest(suggestion.id, onSendRequest)}
          />
        ))}
      </div>
    </Card>
  );
}
