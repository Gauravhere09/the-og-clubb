
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StoryViewerProps {
  currentUserId: string;
}

export function StoryViewer({ currentUserId }: StoryViewerProps) {
  return (
    <div className="mb-6">
      <div className="flex w-max space-x-4 p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex flex-col items-center space-y-1">
                <div className="relative cursor-pointer group">
                  <Avatar className="w-16 h-16 border-2 border-muted p-1">
                    <AvatarFallback>TU</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Tu historia
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximamente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
