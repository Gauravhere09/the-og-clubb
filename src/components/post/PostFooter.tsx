
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
}

export function PostFooter({
  onFileSelect,
  onPollToggle,
  onIdeaToggle,
  onPublish,
  isPending,
  hasContent,
  visibility,
  onVisibilityChange
}: PostFooterProps) {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-4">
        <PostActionButtons 
          onFileSelect={onFileSelect}
          onPollCreate={onPollToggle}
          onIdeaCreate={onIdeaToggle}
          isPending={isPending}
        />
        
        <div className="mx-2">
          <VisibilitySelector 
            visibility={visibility} 
            onVisibilityChange={onVisibilityChange} 
          />
        </div>
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
