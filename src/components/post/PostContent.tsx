
import { useState } from "react";
import { FilePreview } from "./FilePreview";
import { PollDisplay } from "./PollDisplay";
import { IdeaDisplay } from "./IdeaDisplay";
import { MentionsText } from "./MentionsText";
import { ImageModal } from "./ImageModal";

interface PostContentProps {
  post: any;
  postId: string;
  onJoinIdea?: () => void;
}

export function PostContent({ post, postId, onJoinIdea }: PostContentProps) {
  const hasMedia = post.media_url && post.media_type;
  const hasPoll = post.poll !== null;
  const hasIdea = post.idea !== null;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = () => {
    if (post.media_type?.startsWith('image')) {
      setIsImageModalOpen(true);
    }
  };

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
        <div onClick={handleImageClick} className={post.media_type?.startsWith('image') ? 'cursor-pointer' : ''}>
          <FilePreview 
            url={post.media_url} 
            type={post.media_type} 
          />
        </div>
      )}
      
      {/* Image Modal */}
      {hasMedia && post.media_type?.startsWith('image') && (
        <ImageModal 
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={post.media_url}
          altText="Imagen de la publicación"
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

      {/* Idea content */}
      {hasIdea && post.idea && (
        <IdeaDisplay
          idea={post.idea}
          postId={postId}
          isParticipant={post.idea.is_participant}
          onJoinIdea={onJoinIdea}
        />
      )}
    </div>
  );
}
