
import { useState } from "react";
import { FilePreview } from "./FilePreview";
import { PollDisplay } from "./PollDisplay";
import { MentionsText } from "./MentionsText";
import { ImageModal } from "./ImageModal";
import { IdeaDisplay } from "./IdeaDisplay";

interface PostContentProps {
  post: any;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const hasMedia = post.media_url && post.media_type;
  const hasPoll = post.poll !== null;
  const hasIdea = post.idea !== null && post.idea !== undefined;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = () => {
    if (post.media_type?.startsWith('image')) {
      setIsImageModalOpen(true);
    }
  };

  if (!post) {
    console.error("Post is undefined in PostContent");
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Idea content - Si es una idea, mostrarla primero */}
      {hasIdea && post.idea && (
        <IdeaDisplay 
          idea={post.idea} 
          postId={postId}
        />
      )}
      
      {/* Post text content - Solo mostrar si no es una idea */}
      {post.content && !hasIdea && (
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
    </div>
  );
}
