
import { Idea } from "@/types/post";
import { Button } from "@/components/ui/button";
import { IdeaHeader } from "./idea/IdeaHeader";
import { ParticipantsList } from "./idea/ParticipantsList";
import { JoinIdeaDialog } from "./idea/JoinIdeaDialog";
import { useIdeaJoin } from "./idea/useIdeaJoin";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  const isMobile = useIsMobile();
  
  // Usamos una clase de fondo sólido para móvil y mantenemos la transparencia en escritorio
  const bgClass = isMobile 
    ? "border border-border rounded-md bg-blue-100 dark:bg-blue-950 space-y-3" 
    : "border border-border rounded-md bg-blue-50 dark:bg-blue-900 space-y-3";

  return (
    <div className={bgClass}>
      <div className="p-4">
        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
          {idea.description}
        </p>
      </div>
      
      {participants.length > 0 && (
        <>
          <Separator />
          <div className="px-4 py-2">
            <ParticipantsList participants={participants} />
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
