
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "../AudioRecorder";
import { MousePointerClick, PlusCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { StoryCreator } from "../stories/StoryCreator";
import { supabase } from "@/integrations/supabase/client";
import { AttachmentInput } from "@/components/AttachmentInput";

interface PostActionButtonsProps {
  onFileSelect: (file: File) => void;
  onPollCreate: () => void;
  isPending: boolean;
}

export function PostActionButtons({ onFileSelect, onPollCreate, isPending }: PostActionButtonsProps) {
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID when component loads
  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    }
    getUserId();
  }, []);

  const handleFileSelect = (files: File[] | null) => {
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleStoryClick = () => {
    setShowStoryCreator(true);
  };

  return (
    <div className="flex gap-2">
      {/* Mobile dropdown menu with click icon */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <MousePointerClick className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-border">
            <DropdownMenuItem>
              <AttachmentInput
                type="image"
                onAttachmentChange={handleFileSelect}
                showLabel={true}
                buttonVariant="ghost"
                buttonClassName="w-full flex justify-start"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AttachmentInput
                type="video"
                onAttachmentChange={handleFileSelect}
                showLabel={true}
                buttonVariant="ghost"
                buttonClassName="w-full flex justify-start"
              />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPollCreate}>
              <Button variant="ghost" className="w-full flex justify-start">
                Encuesta
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStoryClick}>
              <Button variant="ghost" className="w-full flex justify-start">
                <PlusCircle className="h-4 w-4 mr-2" />
                Historia
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex gap-2">
        <AttachmentInput
          type="image"
          onAttachmentChange={handleFileSelect}
          showLabel={false}
          buttonSize="icon"
          buttonVariant="ghost"
          disabled={isPending}
        />
        <AttachmentInput
          type="video"
          onAttachmentChange={handleFileSelect}
          showLabel={false}
          buttonSize="icon"
          buttonVariant="ghost"
          disabled={isPending}
        />
        <AudioRecorder onRecordingComplete={(blob) => onFileSelect(new File([blob], "audio.webm", { type: "audio/webm" }))} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onPollCreate}
          disabled={isPending}
        >
          Encuesta
        </Button>
      </div>

      {showStoryCreator && currentUserId && (
        <StoryCreator
          onClose={() => setShowStoryCreator(false)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
