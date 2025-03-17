
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
import { PostActionButtons } from "./post/PostActionButtons";
import { FilePreview } from "./post/FilePreview";
import { VisibilitySelector } from "./post/VisibilitySelector";
import { supabase } from "@/integrations/supabase/client";
import { PostContentInput } from "./post/PostContentInput";
import { usePostCreator } from "@/hooks/use-post-creator";
import { UserAvatarDisplay } from "./post/UserAvatarDisplay";

export function PostCreator() {
  const {
    content, 
    setContent,
    file, 
    setFile,
    isUploading,
    showPollCreator, 
    setShowPollCreator,
    visibility, 
    setVisibility,
    currentUser,
    handleFileChange,
    handleSubmitPost,
    handlePollCreate,
    textareaRef,
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextAreaChange,
    handleKeyDown,
    handleSelectMention,
    handleMentionClick,
    setMentionListVisible
  } = usePostCreator();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (pollData?: { question: string; options: string[] }) => {
      if (!content && !file && !pollData) {
        throw new Error("Debes agregar texto, un archivo multimedia o una encuesta");
      }
      return createPost({
        content,
        file,
        pollData,
        visibility
      });
    },
    onSuccess: () => {
      setContent("");
      setFile(null);
      setShowPollCreator(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "¡Publicación creada!",
        description: "Tu publicación se ha compartido exitosamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al crear la publicación",
      });
    },
  });

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <UserAvatarDisplay currentUser={currentUser} />
        
        <PostContentInput
          content={content}
          textareaRef={textareaRef}
          handleTextAreaChange={handleTextAreaChange}
          handleKeyDown={handleKeyDown}
          mentionUsers={mentionUsers}
          mentionListVisible={mentionListVisible}
          mentionPosition={mentionPosition}
          mentionIndex={mentionIndex}
          onSelectUser={handleSelectMention}
          onSetIndex={setMentionIndex}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleMentionClick}
          className="text-sm flex items-center gap-1"
        >
          <span className="sr-only">Mencionar</span>
          <AtSignButton />
        </Button>
        
        <VisibilitySelector 
          visibility={visibility} 
          onVisibilityChange={setVisibility} 
        />
      </div>
      
      {showPollCreator && (
        <PollCreator
          onPollCreate={(pollData) => {
            handlePollCreate(pollData);
            submitPost(pollData);
          }}
          onCancel={() => setShowPollCreator(false)}
        />
      )}
      
      {file && (
        <FilePreview 
          file={file} 
          onRemove={() => setFile(null)} 
        />
      )}
      
      <div className="flex items-center justify-between">
        <PostActionButtons 
          onFileSelect={handleFileChange}
          onPollCreate={() => setShowPollCreator(true)}
          isPending={isPending}
        />
        <Button 
          onClick={() => submitPost(undefined)}
          disabled={isPending || (!content && !file)}
        >
          Publicar
        </Button>
      </div>
    </Card>
  );
}

function AtSignButton() {
  return (
    <AtSign className="h-4 w-4" />
  );
}

import { AtSign } from "lucide-react";
