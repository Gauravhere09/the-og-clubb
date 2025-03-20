
import { cn } from "@/lib/utils";
import { StoryHeader } from "./StoryHeader";
import { StoryControls } from "./StoryControls";
import { StoryContent } from "./StoryContent";
import { StoryReactionSummary } from "./StoryReactionSummary";
import { StoryReaction } from "./StoryReaction";
import { StoryReplyInput } from "./StoryReplyInput";
import { StoryActions } from "./StoryActions";
import { StoryComments } from "./StoryComments";

interface StoryDialogContentProps {
  storyId: string;
  storyData: any;
  timeDisplay: string;
  progress: number;
  currentMediaIndex: number;
  isPaused: boolean;
  isExiting: boolean;
  showReactions: boolean;
  showComments: boolean;
  comments: any[];
  currentUser: any;
  canDeleteStory: boolean;
  onClose: () => void;
  onPauseToggle: (e: React.MouseEvent) => void;
  onDeleteRequest: () => void;
  onContentClick: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  onReactionsToggle: (e: React.MouseEvent) => void;
  onCommentsToggle: (e: React.MouseEvent) => void;
  onCommentsFocus: () => void;
  onCommentsClose: () => void;
  onSendComment: (comment: string) => void;
}

export function StoryDialogContent({
  storyId,
  storyData,
  timeDisplay,
  progress,
  currentMediaIndex,
  isPaused,
  isExiting,
  showReactions,
  showComments,
  comments,
  currentUser,
  canDeleteStory,
  onClose,
  onPauseToggle,
  onDeleteRequest,
  onContentClick,
  onNextImage,
  onPrevImage,
  onReactionsToggle,
  onCommentsToggle,
  onCommentsFocus,
  onCommentsClose,
  onSendComment
}: StoryDialogContentProps) {
  
  return (
    <div
      className={cn(
        "p-0 max-w-md h-[80vh] max-h-[600px] flex flex-col bg-black",
        "animate-in fade-in-0 zoom-in-95 duration-300",
        isExiting && "animate-out fade-out-0 zoom-out-95 duration-300"
      )}
      aria-describedby="story-dialog-description"
    >
      <span id="story-dialog-description" className="sr-only">
        Contenido de la historia de {storyData.user.username}
      </span>
      
      <StoryHeader 
        username={storyData.user.username}
        avatarUrl={storyData.user.avatarUrl}
        timeDisplay={timeDisplay}
        progress={progress}
        currentImageIndex={currentMediaIndex}
        totalImages={storyData.mediaItems.length || 1}
        onClose={onClose}
      />
      
      <StoryControls 
        isPaused={isPaused}
        canDelete={canDeleteStory}
        onPauseToggle={onPauseToggle}
        onDeleteRequest={onDeleteRequest}
      />
      
      <StoryContent 
        mediaItems={storyData.mediaItems || []}
        currentIndex={currentMediaIndex}
        onContentClick={onContentClick}
        onNextImage={onNextImage}
        onPrevImage={onPrevImage}
        isPaused={isPaused}
        className={cn(
          "animate-in fade-in-0 duration-300",
          isExiting && "animate-out fade-out-0 duration-300"
        )}
      />

      <div className="absolute bottom-20 left-4 z-10">
        <StoryReactionSummary storyId={storyId} />
      </div>

      {currentUser && (
        <StoryReaction 
          storyId={storyId}
          userId={currentUser.id}
          showReactions={showReactions}
          className="absolute bottom-24 left-0 right-0 px-4 py-2"
        />
      )}

      <StoryReplyInput 
        onFocus={onCommentsFocus}
      />

      <StoryActions 
        toggleComments={onCommentsToggle}
        toggleReactions={onReactionsToggle}
        onDeleteStory={onDeleteRequest}
        canDelete={canDeleteStory}
        className={cn(
          "animate-in slide-in-from-bottom duration-300",
          isExiting && "animate-out slide-out-to-bottom duration-300"
        )}
      />

      {showComments && (
        <StoryComments 
          comments={comments}
          onSendComment={onSendComment}
          onClose={onCommentsClose}
          className="animate-in slide-in-from-bottom duration-300"
        />
      )}
    </div>
  );
}
