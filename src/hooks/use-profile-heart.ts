
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useProfileHeart(profileId: string) {
  const [hasGivenHeart, setHasGivenHeart] = useState(false);
  const [heartsCount, setHeartsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, []);

  // Load initial heart data
  useEffect(() => {
    const loadHeartData = async () => {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        
        // Get total hearts count
        const { count, error: countError } = await supabase
          .from('profile_hearts')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);
          
        if (countError) throw countError;
        setHeartsCount(count || 0);
        
        // Check if current user has given heart
        if (currentUserId) {
          const { data, error } = await supabase
            .from('profile_hearts')
            .select('id')
            .eq('profile_id', profileId)
            .eq('giver_id', currentUserId);
            
          if (error) throw error;
          setHasGivenHeart(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error loading profile heart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHeartData();
    
    // Set up real-time subscription for heart changes
    const channel = supabase
      .channel('profile_hearts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profile_hearts',
        filter: `profile_id=eq.${profileId}` 
      }, () => {
        loadHeartData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, currentUserId]);

  // Toggle heart function
  const toggleHeart = async () => {
    if (!currentUserId || !profileId || isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (hasGivenHeart) {
        // Remove heart
        const { error } = await supabase
          .from('profile_hearts')
          .delete()
          .eq('profile_id', profileId)
          .eq('giver_id', currentUserId);
          
        if (error) throw error;
        setHasGivenHeart(false);
        setHeartsCount(prev => Math.max(0, prev - 1));
      } else {
        // Add heart
        const { error } = await supabase
          .from('profile_hearts')
          .insert({ 
            profile_id: profileId, 
            giver_id: currentUserId 
          });
          
        if (error) throw error;
        setHasGivenHeart(true);
        setHeartsCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling profile heart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasGivenHeart, heartsCount, isLoading, toggleHeart };
}
