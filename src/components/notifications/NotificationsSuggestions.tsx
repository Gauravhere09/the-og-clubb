
import { Link } from "react-router-dom";
import { FriendSuggestion } from "@/types/friends";
import { SuggestionItem } from "./SuggestionItem";
import { SuggestionsHeader } from "./SuggestionsHeader";
import { useSuggestionRequests } from "@/hooks/use-suggestion-requests";

interface NotificationsSuggestionsProps {
  suggestions: FriendSuggestion[];
  onDismissSuggestion: (userId: string) => void;
  setOpen: (open: boolean) => void;
  onToggleVisibility?: () => void;
  showToggle?: boolean;
}

export function NotificationsSuggestions({ 
  suggestions, 
  onDismissSuggestion, 
  setOpen,
  onToggleVisibility,
  showToggle = false
}: NotificationsSuggestionsProps) {
  const { loadingStates, pendingRequests, sendFriendRequest } = useSuggestionRequests();

  if (suggestions.length === 0) return null;
  
  return (
    <>
      <SuggestionsHeader onToggleVisibility={onToggleVisibility} showToggle={showToggle} />
      
      {suggestions.slice(0, 5).map((suggestion) => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          isPending={pendingRequests[suggestion.id] || false}
          isLoading={loadingStates[suggestion.id] || false}
          onSendRequest={sendFriendRequest}
          onDismiss={onDismissSuggestion}
          setOpen={setOpen}
        />
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
