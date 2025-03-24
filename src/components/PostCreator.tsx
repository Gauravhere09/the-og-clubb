
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
import { IdeaCreator } from "./post/IdeaCreator";
import { FilePreview } from "./post/FilePreview";
import { usePostCreator } from "@/hooks/use-post-creator";
import { PostCreatorHeader } from "./post/PostCreatorHeader";
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

  const [showIdeaCreator, setShowIdeaCreator] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (data?: { 
      pollData?: { question: string; options: string[] },
      ideaData?: { description: string }
    }) => {
      if (!content && !file && !data?.pollData && !data?.ideaData) {
        throw new Error("Debes agregar texto, un archivo multimedia, una encuesta o una idea");
      }
      
      const post_type = data?.pollData ? 'poll' : data?.ideaData ? 'idea' : 'regular';
      
      return createPost({
        content,
        file,
        pollData: data?.pollData,
        ideaData: data?.ideaData,
        visibility,
        post_type
      });
    },
    onSuccess: () => {
      setContent("");
      setFile(null);
      setShowPollCreator(false);
      setShowIdeaCreator(false);
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
    submitPost({ pollData });
  };

  const handleIdeaCreate = (ideaData: { description: string }) => {
    submitPost({ ideaData });
  };

  return (
    <Card className="p-4 space-y-4">
      <PostCreatorHeader 
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
      
      {showIdeaCreator && (
        <IdeaCreator
          onIdeaCreate={handleIdeaCreate}
          onCancel={() => setShowIdeaCreator(false)}
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
        onIdeaToggle={() => setShowIdeaCreator(true)}
        onPublish={() => submitPost(undefined)}
        isPending={isPending}
        hasContent={!!content || !!file}
        visibility={visibility}
        onVisibilityChange={setVisibility}
      />
    </Card>
  );
}
