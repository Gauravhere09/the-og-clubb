
import { Idea } from "@/types/post";
import { Button } from "@/components/ui/button";
import { IdeaHeader } from "./idea/IdeaHeader";
import { ParticipantsList } from "./idea/ParticipantsList";
import { JoinIdeaDialog } from "./idea/JoinIdeaDialog";
import { useIdeaJoin } from "./idea/useIdeaJoin";

interface IdeaDisplayProps {
  idea: Idea;
  postId: string;
}

export function IdeaDisplay({ idea, postId }: IdeaDisplayProps) {
  const {
    participants,
    isCurrentUserJoined,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    handleJoinIdea
  } = useIdeaJoin(idea, postId);

  return (
    <div className="border border-border rounded-md p-4 bg-card/50 space-y-3">
      <IdeaHeader title={idea.title} description={idea.description} />
      
      <ParticipantsList participants={participants} />
      
      {!isCurrentUserJoined && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsJoinDialogOpen(true)}
          className="hidden" // Hidden since it's shown in the actions bar
        >
          Unirme
        </Button>
      )}
      
      <JoinIdeaDialog 
        isOpen={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        onJoin={handleJoinIdea}
        ideaTitle={idea.title}
      />
    </div>
  );
}
