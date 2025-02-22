
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  media_url: string;
  created_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentUserId: string;
}

export function StoryViewer({ stories, currentUserId }: StoryViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateStory = () => {
    // Implementar la creación de historias
    console.log("Crear historia");
  };

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max space-x-4 p-4">
          {/* Create Story Button */}
          <div className="flex flex-col items-center space-y-1">
            <div 
              onClick={handleCreateStory}
              className="relative cursor-pointer group"
            >
              <Avatar className="w-16 h-16 border-2 border-muted p-1">
                <AvatarImage src={stories.find(s => s.user.id === currentUserId)?.user.avatar_url || undefined} />
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

          {/* Friend Stories */}
          {stories.filter(story => story.user.id !== currentUserId).map((story) => (
            <div 
              key={story.id}
              className="flex flex-col items-center space-y-1"
            >
              <Avatar 
                className="w-16 h-16 ring-2 ring-primary p-1 cursor-pointer"
                onClick={() => setIsOpen(true)}
              >
                <AvatarImage src={story.user.avatar_url || undefined} />
                <AvatarFallback>{story.user.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                {story.user.username}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-md h-[80vh] p-0">
          <div className="w-full h-full bg-black flex items-center justify-center">
            <span className="text-white">Historia seleccionada</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
