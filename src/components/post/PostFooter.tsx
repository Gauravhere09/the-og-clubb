
import { Button } from "@/components/ui/button";
import { PostActionButtons } from "./PostActionButtons";
import { VisibilitySelector } from "./VisibilitySelector";
import { useState, useEffect } from "react";
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
