
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts, getHiddenPosts } from "@/lib/api";
import { transformPoll } from "@/lib/utils/transform-poll";
import type { Post } from "@/types/post";

export function useFeed(userId?: string, showNewPosts: boolean = false) {
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Fetch hidden posts
  const { data: hiddenPosts = [] } = useQuery({
    queryKey: ["hidden-posts"],
    queryFn: getHiddenPosts,
  });

  // Update hiddenPostIds when hiddenPosts changes
  useEffect(() => {
    if (hiddenPosts && hiddenPosts.length > 0) {
      setHiddenPostIds(hiddenPosts);
    }
  }, [hiddenPosts]);

  // Fetch and transform posts
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data) => {
      let transformedPosts = data.map(post => ({
        ...post,
        poll: transformPoll(post.poll)
      }));

      // Always sort by most recent
      transformedPosts = transformedPosts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (showNewPosts) {
        // Filter for posts from the last 24 hours
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

  // Toggle hidden posts visibility
  const toggleHiddenPosts = () => {
    setShowHidden(!showHidden);
  };

  // Filter visible and hidden posts
  const visiblePosts = showHidden 
    ? posts 
    : posts.filter(post => !hiddenPostIds.includes(post.id));
  
  const onlyHiddenPosts = posts.filter(post => hiddenPostIds.includes(post.id));

  return {
    visiblePosts,
    onlyHiddenPosts,
    isLoading,
    showHidden,
    toggleHiddenPosts,
    refetch
  };
}
