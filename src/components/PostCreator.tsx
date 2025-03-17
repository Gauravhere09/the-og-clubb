
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
import { FilePreview } from "./post/FilePreview";
import { usePostCreator } from "@/hooks/use-post-creator";
import { PostHeader } from "./post/PostHeader";
import { PostFooter } from "./post/PostFooter";

export function PostCreator() {
  const {
    content, 
    setContent,
    file, 
    setFile,
    showPollCreator, 
    setShowPollCreator,
    visibility, 
    setVisibility,
    currentUser,
    handleFileChange,
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

  const handlePollCreate = (pollData: { question: string; options: string[] }) => {
    submitPost(pollData);
  };

  return (
    <Card className="p-4 space-y-4">
      <PostHeader 
        currentUser={currentUser}
        content={content}
        textareaRef={textareaRef}
        mentionUsers={mentionUsers}
        mentionListVisible={mentionListVisible}
        mentionPosition={mentionPosition}
        mentionIndex={mentionIndex}
        handleTextAreaChange={handleTextAreaChange}
        handleKeyDown={handleKeyDown}
        handleSelectMention={handleSelectMention}
        handleMentionClick={handleMentionClick}
        setMentionIndex={setMentionIndex}
      />
      
      {showPollCreator && (
        <PollCreator
          onPollCreate={handlePollCreate}
          onCancel={() => setShowPollCreator(false)}
        />
      )}
      
      {file && (
        <FilePreview 
          file={file} 
          onRemove={() => setFile(null)} 
        />
      )}
      
      <PostFooter 
        onFileSelect={handleFileChange}
        onPollToggle={() => setShowPollCreator(true)}
        onPublish={() => submitPost(undefined)}
        isPending={isPending}
        hasContent={!!content || !!file}
        visibility={visibility}
        onVisibilityChange={setVisibility}
      />
    </Card>
  );
}
