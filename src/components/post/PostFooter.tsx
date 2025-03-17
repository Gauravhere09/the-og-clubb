
import { Button } from "@/components/ui/button";
import { PostActionButtons } from "./PostActionButtons";
import { VisibilitySelector } from "./VisibilitySelector";

interface PostFooterProps {
  onFileSelect: (file: File) => void;
  onPollToggle: () => void;
  onPublish: () => void;
  isPending: boolean;
  hasContent: boolean;
  visibility: 'public' | 'friends' | 'private';
  onVisibilityChange: (visibility: 'public' | 'friends' | 'private') => void;
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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <PostActionButtons 
          onFileSelect={onFileSelect}
          onPollCreate={onPollToggle}
          isPending={isPending}
        />
        
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
  );
}
