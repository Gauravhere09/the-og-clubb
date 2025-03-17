
import { AdComponent } from "@/components/ads/AdComponent";
import { Post } from "@/components/Post";
import { PeopleYouMayKnow } from "@/components/friends/PeopleYouMayKnow";
import type { Post as PostType } from "@/types/post";

interface FeedContentProps {
  visiblePosts: PostType[];
  hiddenPosts: PostType[];
  showHidden: boolean;
  isMobile: boolean;
}

export function FeedContent({ 
  visiblePosts, 
  hiddenPosts, 
  showHidden, 
  isMobile 
}: FeedContentProps) {
  const renderHiddenPosts = () => {
    if (!showHidden || hiddenPosts.length === 0) return null;
    
    return hiddenPosts.map(post => (
      <div key={post.id} className="relative mb-4">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-10 z-0 pointer-events-none"></div>
        <Post key={post.id} post={post} isHidden={true} />
      </div>
    ));
  };
  
  const renderFeedPosts = () => {
    const feedContent = [];
    
    // Insert banner ad at the top on mobile only
    if (isMobile) {
      feedContent.push(
        <AdComponent key="ad-top-mobile" format="banner" className="mt-2 mb-4 ad-component-mobile" />
      );
    }
    
    // Distribute posts and ads together
    const allPosts = visiblePosts.slice();
    
    for (let i = 0; i < allPosts.length; i++) {
      // Add a post
      feedContent.push(
        <div key={allPosts[i].id} className="mb-4">
          <Post post={allPosts[i]} />
        </div>
      );
      
      // Add an ad after every 3 posts
      if ((i + 1) % 3 === 0 && i < allPosts.length - 1) {
        feedContent.push(
          <AdComponent key={`ad-${i}`} format="feed" className="mb-4 mx-auto" />
        );
      }
      
      // Add People You May Know after 5 posts
      if (i === 4 && !isMobile) {
        feedContent.push(
          <PeopleYouMayKnow key="people-you-may-know" />
        );
      }
    }
    
    // Add People You May Know for mobile at the end
    if (isMobile && visiblePosts.length >= 3) {
      feedContent.push(
        <PeopleYouMayKnow key="people-you-may-know-mobile" />
      );
    }
    
    return feedContent;
  };

  return (
    <>
      {renderHiddenPosts()}
      {renderFeedPosts()}
    </>
  );
}
