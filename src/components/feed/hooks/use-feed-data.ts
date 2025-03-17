
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getPosts, getHiddenPosts } from "@/lib/api";
import { transformPoll } from "../utils/transform-poll";
import type { Post } from "@/types/post";

export function useFeedData(userId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  const { data: hiddenPosts = [] } = useQuery({
    queryKey: ["hidden-posts"],
    queryFn: getHiddenPosts,
  });

  useEffect(() => {
    if (hiddenPosts && hiddenPosts.length > 0) {
      setHiddenPostIds(hiddenPosts);
    }
  }, [hiddenPosts]);

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
    : posts.filter(post => !hiddenPostIds.includes(post.id));
  
  const onlyHiddenPosts = posts.filter(post => hiddenPostIds.includes(post.id));

  const toggleHiddenPosts = () => setShowHidden(!showHidden);

  return {
    visiblePosts,
    hiddenPosts: onlyHiddenPosts,
    showHidden,
    toggleHiddenPosts,
    isLoading
  };
}
