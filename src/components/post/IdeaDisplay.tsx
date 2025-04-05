
import { Idea } from "@/types/post";
import { Button } from "@/components/ui/button";
import { IdeaHeader } from "./idea/IdeaHeader";
import { ParticipantsList } from "./idea/ParticipantsList";
import { JoinIdeaDialog } from "./idea/JoinIdeaDialog";
import { useIdeaJoin } from "./idea/useIdeaJoin";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";

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
    <div className="border border-border rounded-md bg-blue-50 dark:bg-blue-900 space-y-3">
      <div className="p-4">
        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
          {idea.description}
        </p>
      </div>
      
      {participants.length > 0 && (
        <>
          <Separator />
          <div className="px-4 py-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{participants.length} {participants.length === 1 ? 'persona se ha unido' : 'personas se han unido'}</span>
            </div>
          </div>
        </>
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
