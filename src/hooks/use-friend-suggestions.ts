
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FriendSuggestion } from "@/types/friends";

export function useFriendSuggestions(suggestions: FriendSuggestion[]) {
  const [requestedFriends, setRequestedFriends] = useState<Record<string, boolean>>({});
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Check if there's an existing friend request
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

  // Load existing friend requests for all suggestions
  useEffect(() => {
    const loadExistingRequests = async () => {
      setIsLoadingRequests(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingRequests(false);
        return;
      }

      const requests = {};
      for (const suggestion of suggestions) {
        const hasRequest = await checkExistingRequest(suggestion.id);
        if (hasRequest) {
          requests[suggestion.id] = true;
        }
      }
      setRequestedFriends(requests);
      setIsLoadingRequests(false);
    };

    loadExistingRequests();
  }, [suggestions]);

  return {
    requestedFriends,
    isLoadingRequests,
    checkExistingRequest
  };
}
