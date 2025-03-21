
import { useEffect, useCallback } from "react";
import { useFriendFetch } from "./api/use-friend-fetch";
import { useFriendState } from "./api/use-friend-state";
import { useFriendSubscription } from "./api/use-friend-subscription";
import { Friend, FriendRequest, FriendSuggestion } from "./types";

export function useFriendData(currentUserId: string | null) {
  const {
    fetchFriends,
    fetchFriendRequests,
    fetchSuggestions,
    setLoading
  } = useFriendFetch(currentUserId);
  
  const {
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    updateFriendsState,
    updateRequestsState,
    updateSuggestionsState
  } = useFriendState();

  const loadFriends = useCallback(async () => {
    if (!currentUserId) return;
    
    const { mutualFriends, onlyFollowing, onlyFollowers } = await fetchFriends();
    
    // Map the properties to ensure compatibility with both naming patterns
    const mappedMutualFriends = mutualFriends.map(friend => ({
      ...friend,
      id: friend.friend_id,
      username: friend.friend_username,
      avatar_url: friend.friend_avatar_url,
      // Ensure both naming patterns are included
      friend_id: friend.friend_id,
      friend_username: friend.friend_username,
      friend_avatar_url: friend.friend_avatar_url
    }));
    
    const mappedOnlyFollowing = onlyFollowing.map(friend => ({
      ...friend,
      id: friend.friend_id,
      username: friend.friend_username,
      avatar_url: friend.friend_avatar_url,
      // Ensure both naming patterns are included
      friend_id: friend.friend_id,
      friend_username: friend.friend_username,
      friend_avatar_url: friend.friend_avatar_url
    }));
    
    const mappedOnlyFollowers = onlyFollowers.map(friend => ({
      ...friend,
      id: friend.friend_id,
      username: friend.friend_username,
      avatar_url: friend.friend_avatar_url,
      // Ensure both naming patterns are included
      friend_id: friend.friend_id,
      friend_username: friend.friend_username,
      friend_avatar_url: friend.friend_avatar_url
    }));
    
    updateFriendsState(mappedMutualFriends, mappedOnlyFollowing, mappedOnlyFollowers);
  }, [currentUserId, fetchFriends, updateFriendsState]);

  const loadFriendRequests = useCallback(async () => {
    if (!currentUserId) return;
    
    const { pendingRequests, sentRequests } = await fetchFriendRequests();
    updateRequestsState(pendingRequests, sentRequests);
  }, [currentUserId, fetchFriendRequests, updateRequestsState]);

  const loadSuggestions = useCallback(async () => {
    if (!currentUserId) return;
    
    const suggestionsData = await fetchSuggestions();
    updateSuggestionsState(suggestionsData);
  }, [currentUserId, fetchSuggestions, updateSuggestionsState]);

  const updateAllData = useCallback(() => {
    loadFriends();
    loadFriendRequests();
    loadSuggestions();
  }, [loadFriends, loadFriendRequests, loadSuggestions]);

  // Setup real-time subscription
  useFriendSubscription(currentUserId, updateAllData);

  // Initial data load
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadSuggestions()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [currentUserId, loadFriends, loadFriendRequests, loadSuggestions, setLoading]);

  return {
    friends,
    following,
    followers,
    pendingRequests,
    sentRequests,
    suggestions,
    loading,
    loadFriends,
    loadFriendRequests,
    loadSuggestions,
  };
}
