
import { useEffect, useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { FeedContent } from "./FeedContent";
import { Eye, EyeOff } from "lucide-react";
import { HiddenPostsToggle } from "./HiddenPostsToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { getHiddenPosts } from "@/lib/api/posts/manage";

interface FeedProps {
  userId?: string;
  excludeIncognito?: boolean;
}

export function Feed({ userId, excludeIncognito = false }: FeedProps) {
  const { posts, isLoading, refetch } = usePosts(userId);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [isLoadingHidden, setIsLoadingHidden] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const isMobile = useIsMobile();

  // Load hidden post IDs
  useEffect(() => {
    const loadHiddenPosts = async () => {
      try {
        const hiddenIds = await getHiddenPosts();
        setHiddenPostIds(hiddenIds);
      } catch (error) {
        console.error("Error fetching hidden posts:", error);
      } finally {
        setIsLoadingHidden(false);
      }
    };

    loadHiddenPosts();
  }, []);

  // Filter posts based on hidden status and incognito setting
  const filteredPosts = posts.filter(post => {
    // Filter out incognito posts if requested
    if (excludeIncognito && post.visibility === 'incognito') {
      return false;
    }
    
    // Handle hidden posts display logic
    const isHidden = hiddenPostIds.includes(post.id);
    if (isHidden && !showHidden) {
      return false;
    }
    return true;
  });

  // Separate visible and hidden posts
  const visiblePosts = filteredPosts.filter(post => !hiddenPostIds.includes(post.id));
  const hiddenPosts = showHidden ? filteredPosts.filter(post => hiddenPostIds.includes(post.id)) : [];

  // Handle the refresh logic
  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading || isLoadingHidden) {
    return <FeedSkeleton />;
  }

  if (!isLoading && filteredPosts.length === 0) {
    return <EmptyFeed userId={userId} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
        >
          Actualizar
        </Button>
        
        {hiddenPostIds.length > 0 && (
          <HiddenPostsToggle 
            showHidden={showHidden} 
            onToggle={() => setShowHidden(!showHidden)}
            count={hiddenPostIds.length}
          />
        )}
      </div>
      
      <FeedContent 
        visiblePosts={visiblePosts} 
        hiddenPosts={hiddenPosts} 
        showHidden={showHidden}
        isMobile={isMobile}
      />
    </div>
  );
}
