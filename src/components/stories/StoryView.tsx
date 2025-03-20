
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStoryView } from "@/hooks/use-story-view";
import { StoryDialogContent } from "./StoryDialogContent";
import { StoryDeleteConfirmation } from "./StoryDeleteConfirmation";

interface StoryViewProps {
  storyId: string;
  onClose: () => void;
  userId?: string;
}

export function StoryView({ storyId, onClose, userId }: StoryViewProps) {
  const {
    storyData,
    timeDisplay,
    progress,
    isPaused,
    isExiting,
    currentMediaIndex,
    showReactions,
    showComments,
    showDeleteConfirm,
    comments,
    currentUser,
    canDeleteStory,
    setShowDeleteConfirm,
    setShowComments,
    setIsPaused,
    handleDeleteStory,
    handleClose,
    toggleReactionsPanel,
    togglePause,
    handleCommentsToggle,
    handleContentClick,
    handleNextMedia,
    handlePrevMedia,
    handleSendComment
  } = useStoryView({ storyId, userId, onClose });
  
  return (
    <>
      <Dialog open={true} onOpenChange={() => handleClose()}>
        <DialogTitle className="sr-only">Ver historia</DialogTitle>
        <DialogContent className="p-0">
          <StoryDialogContent
            storyId={storyId}
            storyData={storyData}
            timeDisplay={timeDisplay}
            progress={progress}
            currentMediaIndex={currentMediaIndex}
            isPaused={isPaused}
            isExiting={isExiting}
            showReactions={showReactions}
            showComments={showComments}
            comments={comments}
            currentUser={currentUser}
            canDeleteStory={canDeleteStory}
            onClose={handleClose}
            onPauseToggle={togglePause}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
            onContentClick={handleContentClick}
            onNextImage={handleNextMedia}
            onPrevImage={handlePrevMedia}
            onReactionsToggle={toggleReactionsPanel}
            onCommentsToggle={handleCommentsToggle}
            onCommentsFocus={() => {
              setIsPaused(true);
              setShowComments(true);
            }}
            onCommentsClose={() => {
              setShowComments(false);
              setIsPaused(false);
            }}
            onSendComment={handleSendComment}
          />
        </DialogContent>
      </Dialog>

      <StoryDeleteConfirmation 
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteStory}
      />
    </>
  );
}
