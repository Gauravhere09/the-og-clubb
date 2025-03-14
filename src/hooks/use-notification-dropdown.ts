
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFriends } from "@/hooks/use-friends";
import { useNotifications } from "@/hooks/use-notifications";

export function useNotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { notifications, handleFriendRequest, markAsRead, clearAllNotifications } = useNotifications();
  const [hasUnread, setHasUnread] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { suggestions } = useFriends(currentUserId);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Group notifications by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString();
    
    let group = "older";
    if (date === today) group = "today";
    else if (date === yesterday) group = "yesterday";
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    
    return acc;
  }, { today: [], yesterday: [], older: [] });

  useEffect(() => {
    const hasUnreadNotifications = notifications.some((notification) => !notification.read);
    setHasUnread(hasUnreadNotifications);
    
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, [notifications]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setHasUnread(false);
  };

  const handleDismissSuggestion = (userId: string) => {
    // Esta función podría implementarse más adelante para persistir
    // las sugerencias descartadas en la base de datos
    console.log(`Dismissed suggestion for user ${userId}`);
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return {
    open,
    setOpen,
    hasUnread,
    notifications,
    groupedNotifications,
    handleFriendRequest,
    markAsRead,
    currentUserId,
    suggestions,
    showSuggestions,
    toggleSuggestions,
    handleMarkAllAsRead,
    handleDismissSuggestion
  };
}
