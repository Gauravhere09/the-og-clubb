
import { FriendSuggestion } from "@/types/friends";
import { SuggestionsHeader } from "./SuggestionsHeader";
import { SuggestionItem } from "./SuggestionItem";
import { SuggestionsFooter } from "./SuggestionsFooter";
import { useFriendRequestMutation } from "./useFriendRequestMutation";

interface NotificationsSuggestionsListProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
}

export function NotificationsSuggestionsList({
  suggestions,
  onDismissSuggestion,
  setOpen
}: NotificationsSuggestionsListProps) {
  const { loadingStates, pendingRequests, sendFriendRequest } = useFriendRequestMutation();

  if (suggestions.length === 0) return null;

  return (
    <>
      <SuggestionsHeader />
      
      {suggestions.slice(0, 5).map((suggestion) => (
        <SuggestionItem 
          key={suggestion.id}
          suggestion={suggestion}
          isPending={pendingRequests[suggestion.id] || false}
          isLoading={loadingStates[suggestion.id] || false}
          onAddFriend={sendFriendRequest}
          onDismiss={onDismissSuggestion}
          setOpen={setOpen}
        />
      ))}
      
      <SuggestionsFooter setOpen={setOpen} />
    </>
  );
}
