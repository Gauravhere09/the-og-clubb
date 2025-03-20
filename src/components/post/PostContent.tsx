
import { useState } from "react";
import { FilePreview } from "./FilePreview";
import { PollDisplay } from "./PollDisplay";
import { MentionsText } from "./MentionsText";

interface PostContentProps {
  post: any;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const hasMedia = post.media_url && post.media_type;
  const hasPoll = post.poll !== null;
  const [imageModalOpen, setImageModalOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Post text content */}
      {post.content && (
        <div className="text-sm whitespace-pre-wrap break-words">
          <MentionsText content={post.content} />
        </div>
      )}
      
      {/* Media content */}
      {hasMedia && (
        <FilePreview 
          url={post.media_url} 
          type={post.media_type} 
          isModalOpen={imageModalOpen}
          setIsModalOpen={setImageModalOpen}
        />
      )}
      
      {/* Poll content */}
      {hasPoll && post.poll && (
        <PollDisplay 
          poll={post.poll} 
          postId={postId}
          userVote={post.user_vote}
        />
      )}
    </div>
  );
}
