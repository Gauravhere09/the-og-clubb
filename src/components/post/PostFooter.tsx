
import { Button } from "@/components/ui/button";
import { PostActionButtons } from "./PostActionButtons";
import { VisibilitySelector } from "./VisibilitySelector";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { StoryCreator } from "../stories/StoryCreator";
import { supabase } from "@/integrations/supabase/client";

interface PostFooterProps {
  onFileSelect: (file: File) => void;
  onPollToggle: () => void;
  onPublish: () => void;
  isPending: boolean;
  hasContent: boolean;
  visibility: 'public' | 'friends' | 'incognito';
  onVisibilityChange: (visibility: 'public' | 'friends' | 'incognito') => void;
}

export function PostFooter({
  onFileSelect,
  onPollToggle,
  onPublish,
  isPending,
  hasContent,
  visibility,
  onVisibilityChange
}: PostFooterProps) {
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

  const handleStoryClick = () => {
    setShowStoryCreator(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PostActionButtons 
            onFileSelect={onFileSelect}
            onPollCreate={onPollToggle}
            isPending={isPending}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStoryClick}
            className="text-primary hover:text-primary/90 flex items-center gap-1 hidden md:flex"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Historia</span>
          </Button>
          
          <VisibilitySelector 
            visibility={visibility} 
            onVisibilityChange={onVisibilityChange} 
          />
        </div>
        
        <Button 
          onClick={onPublish}
          disabled={isPending || !hasContent}
        >
          Publicar
        </Button>
      </div>

      {showStoryCreator && currentUserId && (
        <StoryCreator
          onClose={() => setShowStoryCreator(false)}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
