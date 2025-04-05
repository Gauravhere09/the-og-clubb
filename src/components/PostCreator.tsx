
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
    mutationFn: async (params: { 
      pollData?: { question: string; options: string[] },
      ideaData?: { title: string; description: string }
    }) => {
      const { pollData, ideaData } = params;
      
      if (!content && !file && !pollData && !ideaData) {
        throw new Error("Debes agregar texto, un archivo multimedia, una encuesta o una idea");
      }
      
      return createPost({
        content,
        file,
        pollData,
        ideaData,
        visibility
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

  const handleIdeaCreate = (ideaData: { title: string; description: string }) => {
    submitPost({ ideaData });
    setShowIdeaCreator(false); // Hide idea creator after submitting
  };

  const handlePublish = () => {
    // Only publish regular post when no special content is being created
    if (!showPollCreator && !showIdeaCreator) {
      submitPost({});
    }
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
        onPublish={handlePublish}
        isPending={isPending}
        hasContent={!!content || !!file}
        visibility={visibility}
        onVisibilityChange={setVisibility}
      />
    </Card>
  );
}
