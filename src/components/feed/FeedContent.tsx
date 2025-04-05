
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
      <div key={post.id} className="relative mb-4 space-y-4">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-10 z-0 pointer-events-none"></div>
        <Post key={post.id} post={post} isHidden={true} />
      </div>
    ));
  };
  
  const renderFeedPosts = () => {
    const feedContent = [];
    
    // Distribute posts without ads
    const allPosts = visiblePosts.slice();
    
    for (let i = 0; i < allPosts.length; i++) {
      // Add a post with spacing
      feedContent.push(
        <div key={allPosts[i].id} className="mb-6 space-y-4">
          <Post post={allPosts[i]} />
        </div>
      );
      
      // Add People You May Know after 5 posts on desktop, after 6 on mobile
      if ((isMobile ? i === 6 : i === 4) && !feedContent.some(item => item.key === "people-you-may-know")) {
        feedContent.push(
          <div key="people-you-may-know" className="mb-6">
            <PeopleYouMayKnow />
          </div>
        );
      }
    }
    
    return feedContent;
  };

  return (
    <div className="space-y-6">
      {renderHiddenPosts()}
      {renderFeedPosts()}
    </div>
  );
}
