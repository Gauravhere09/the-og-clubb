
import { FriendSuggestionsList } from "./FriendSuggestionsList";
import { FriendSuggestion } from "@/hooks/use-friends";

interface SuggestionsSectionProps {
  suggestions: FriendSuggestion[];
  handleFriendRequest: (userId: string) => Promise<void>;
}

export function SuggestionsSection({ 
  suggestions, 
  handleFriendRequest 
}: SuggestionsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Personas que quizás conozcas</h2>
      <FriendSuggestionsList 
        suggestions={suggestions} 
        onSendRequest={handleFriendRequest} 
      />
    </div>
  );
}
