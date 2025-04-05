
import { Button } from "@/components/ui/button";
import { PostActionButtons } from "./PostActionButtons";
import { VisibilitySelector } from "./VisibilitySelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PostFooterProps {
  onFileSelect: (file: File) => void;
  onPollToggle: () => void;
  onIdeaToggle: () => void;
  onPublish: () => void;
  isPending: boolean;
  hasContent: boolean;
  visibility: 'public' | 'friends' | 'incognito';
  onVisibilityChange: (visibility: 'public' | 'friends' | 'incognito') => void;
  isIdeaMode?: boolean;
}

export function PostFooter({
  onFileSelect,
  onPollToggle,
  onIdeaToggle,
  onPublish,
  isPending,
  hasContent,
  visibility,
  onVisibilityChange,
  isIdeaMode = false
}: PostFooterProps) {
  return (
    <div className="flex items-center justify-between mt-2 border-t pt-2">
      <div className="flex items-center">
        <PostActionButtons 
          onFileSelect={onFileSelect}
          onPollCreate={onPollToggle}
          onIdeaCreate={onIdeaToggle}
          isPending={isPending}
          isIdeaMode={isIdeaMode}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <VisibilitySelector 
          visibility={visibility} 
          onVisibilityChange={onVisibilityChange} 
        />
        
        <Button 
          onClick={onPublish}
          disabled={isPending || !hasContent}
          className="bg-primary hover:bg-primary/90 text-white px-6 rounded-full"
        >
          {isIdeaMode ? "Publicar idea" : "Publicar"}
        </Button>
      </div>
    </div>
  );
}
