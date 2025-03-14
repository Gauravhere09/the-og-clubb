
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFeed } from "@/hooks/use-feed";
import { FeedLoading } from "@/components/feed/FeedLoading";
import { EmptyFeed } from "@/components/feed/EmptyFeed";
import { HiddenPostsToggle } from "@/components/feed/HiddenPostsToggle";
import { HiddenPosts } from "@/components/feed/HiddenPosts";
import { FeedPosts } from "@/components/feed/FeedPosts";
import { PeopleYouMayKnow } from "@/components/friends/PeopleYouMayKnow";

interface FeedProps {
  userId?: string;
}

export function Feed({ userId }: FeedProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  
  const {
    visiblePosts,
    onlyHiddenPosts,
    isLoading,
    showHidden,
    toggleHiddenPosts,
    refetch
  } = useFeed(userId, showNew);

  // When new posts parameter is detected, refetch and clear the parameter
  useEffect(() => {
    if (showNew) {
      refetch().then(() => {
        setSearchParams({});
      });
    }
  }, [showNew, refetch, setSearchParams]);

  if (isLoading) {
    return <FeedLoading />;
  }

  if (!visiblePosts.length && !onlyHiddenPosts.length) {
    return <EmptyFeed />;
  }

  // Divide posts to insert PeopleYouMayKnow component
  const renderFeedContent = () => {
    const feedContent = [];
    
    // Add toggle for hidden posts
    feedContent.push(
      <HiddenPostsToggle 
        key="hidden-posts-toggle"
        showHidden={showHidden}
        onToggle={toggleHiddenPosts}
        hiddenPostsCount={onlyHiddenPosts.length}
      />
    );
    
    // Show hidden posts if enabled
    feedContent.push(
      <HiddenPosts 
        key="hidden-posts"
        posts={onlyHiddenPosts}
        show={showHidden}
      />
    );
    
    // Clone the visible posts array
    const visiblePostsCopy = [...visiblePosts];
    
    // Handle insertion of PeopleYouMayKnow based on post count
    if (visiblePostsCopy.length <= 3) {
      if (visiblePostsCopy.length > 0) {
        // Show first post
        const firstPost = visiblePostsCopy.shift();
        feedContent.push(
          <div key={firstPost!.id} className="mb-4">
            <FeedPosts posts={[firstPost!]} />
          </div>
        );
      }
      
      // Insert PeopleYouMayKnow after first post or at beginning if no posts
      feedContent.push(
        <PeopleYouMayKnow key="people-you-may-know" />
      );
      
      // Show remaining posts
      if (visiblePostsCopy.length > 0) {
        feedContent.push(
          <FeedPosts key="remaining-posts" posts={visiblePostsCopy} />
        );
      }
    } else {
      // For more than 3 posts, show first 2, then suggestions, then the rest
      const firstBatch = visiblePostsCopy.splice(0, 2);
      
      feedContent.push(
        <FeedPosts key="first-batch" posts={firstBatch} />
      );
      
      feedContent.push(
        <PeopleYouMayKnow key="people-you-may-know" />
      );
      
      feedContent.push(
        <FeedPosts key="remaining-posts" posts={visiblePostsCopy} />
      );
    }
    
    return feedContent;
  };

  return (
    <div className="space-y-0">
      {renderFeedContent()}
    </div>
  );
}
