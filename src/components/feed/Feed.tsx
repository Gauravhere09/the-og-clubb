
import { FeedSkeleton } from "./FeedSkeleton";
import { EmptyFeed } from "./EmptyFeed";
import { HiddenPostsToggle } from "./HiddenPostsToggle";
import { FeedContent } from "./FeedContent";
import { useFeedData } from "./hooks/use-feed-data";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const isMobile = useIsMobile();
  const { 
    visiblePosts,
    hiddenPosts,
    showHidden,
    toggleHiddenPosts,
    isLoading
  } = useFeedData(userId);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (visiblePosts.length === 0 && hiddenPosts.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-0">
      <HiddenPostsToggle 
        hiddenPostsCount={hiddenPosts.length}
        showHidden={showHidden}
        onToggleHidden={toggleHiddenPosts}
      />
      
      <FeedContent 
        visiblePosts={visiblePosts}
        hiddenPosts={hiddenPosts}
        showHidden={showHidden}
        isMobile={isMobile}
      />
    </div>
  );
}
