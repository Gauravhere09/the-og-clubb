
import { Idea } from "@/types/post";
import { Button } from "@/components/ui/button";
import { IdeaHeader } from "./idea/IdeaHeader";
import { ParticipantsList } from "./idea/ParticipantsList";
import { JoinIdeaDialog } from "./idea/JoinIdeaDialog";
import { useIdeaJoin } from "./idea/useIdeaJoin";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Users } from "lucide-react";
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
  
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 space-y-3 rounded-md">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">{idea.title}</h3>
        </div>
        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
          {idea.description}
        </p>
      </div>
      
      <Separator />
      
      <div className="px-4 py-2">
        <ParticipantsList participants={participants} />
      </div>
      
      <JoinIdeaDialog 
        isOpen={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        onJoin={handleJoinIdea}
        ideaTitle={idea.title}
      />
    </div>
  );
}
