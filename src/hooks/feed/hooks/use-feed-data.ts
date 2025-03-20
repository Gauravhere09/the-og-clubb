
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPosts, getHiddenPosts } from "@/lib/api";
import { transformPoll } from "../utils/transform-poll";
import { supabase } from "@/integrations/supabase/client";
import type { Post } from "@/types/post";

export function useFeedData(userId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Get hidden posts
  useEffect(() => {
    const getHiddenData = async () => {
      try {
        // Get hidden posts
        const hiddenPostsIds = await getHiddenPosts();
        setHiddenPostIds(hiddenPostsIds);
        
        // Get hidden users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: hiddenUsers } = await supabase
            .from('hidden_users')
            .select('hidden_user_id')
            .eq('user_id', user.id);
          
          if (hiddenUsers) {
            setHiddenUserIds(hiddenUsers.map(h => h.hidden_user_id));
          }
        }
      } catch (error) {
        console.error("Error fetching hidden data:", error);
      }
    };
    
    getHiddenData();
  }, []);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data) => {
      let transformedPosts = data.map(post => ({
        ...post,
        poll: transformPoll(post.poll)
      }));

      transformedPosts = transformedPosts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (showNew) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        transformedPosts = transformedPosts
          .filter(post => {
            const postDate = new Date(post.created_at);
            return postDate > twentyFourHoursAgo;
          });
      }

      return transformedPosts;
    }
  });

  useEffect(() => {
    if (showNew) {
      refetch().then(() => {
        setSearchParams({});
      });
    }
  }, [showNew, refetch, setSearchParams]);

  const visiblePosts = showHidden 
    ? posts 
    : posts.filter(post => 
        !hiddenPostIds.includes(post.id) && 
        !hiddenUserIds.includes(post.user_id)
      );
  
  const hiddenPosts = posts.filter(post => 
    hiddenPostIds.includes(post.id) || 
    hiddenUserIds.includes(post.user_id)
  );

  const toggleHiddenPosts = () => setShowHidden(!showHidden);

  return {
    visiblePosts,
    hiddenPosts,
    showHidden,
    toggleHiddenPosts,
    isLoading
  };
}
