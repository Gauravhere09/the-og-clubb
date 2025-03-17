
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "../AudioRecorder";
import { Image, Video, BarChart, MousePointerClick, PlusCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { StoryCreator } from "../stories/StoryCreator";
import { supabase } from "@/integrations/supabase/client";

interface PostActionButtonsProps {
  onFileSelect: (file: File) => void;
  onPollCreate: () => void;
  isPending: boolean;
}

export function PostActionButtons({ onFileSelect, onPollCreate, isPending }: PostActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Obtener el ID del usuario actual al cargar el componente
  useState(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    }
    getUserId();
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleMediaSelect = (type: 'image' | 'video') => {
    setMediaType(type);
    fileInputRef.current?.click();
  };

  const handleStoryClick = () => {
    setShowStoryCreator(true);
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={mediaType === 'image' ? "image/*" : "video/*,audio/*"}
        className="hidden"
      />

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
            <DropdownMenuItem onClick={() => handleMediaSelect('image')}>
              <Image className="h-4 w-4 mr-2" />
              <span>Imagen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMediaSelect('video')}>
              <Video className="h-4 w-4 mr-2" />
              <span>Video</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPollCreate}>
              <BarChart className="h-4 w-4 mr-2" />
              <span>Encuesta</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStoryClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>Historia</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMediaSelect('image')}
          disabled={isPending}
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMediaSelect('video')}
          disabled={isPending}
        >
          <Video className="h-4 w-4" />
        </Button>
        <AudioRecorder onRecordingComplete={(blob) => onFileSelect(new File([blob], "audio.webm", { type: "audio/webm" }))} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onPollCreate}
          disabled={isPending}
        >
          <BarChart className="h-4 w-4" />
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
