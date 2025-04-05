
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
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

  const [isIdeaMode, setIsIdeaMode] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitPost, isPending } = useMutation({
    mutationFn: async (params: { 
      pollData?: { question: string; options: string[] }
    }) => {
      const { pollData } = params;
      
      if (!content && !file && !pollData && !isIdeaMode) {
        throw new Error("Debes agregar texto, un archivo multimedia, una encuesta o una idea");
      }
      
      // Si estamos en modo idea, creamos una idea con el contenido como título y descripción
      const ideaData = isIdeaMode ? {
        title: content,
        description: content
      } : undefined;
      
      return createPost({
        content: "", // Si es idea, no enviamos contenido en el post
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
      setIsIdeaMode(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: isIdeaMode ? "¡Idea creada!" : "¡Publicación creada!",
        description: isIdeaMode 
          ? "Tu idea se ha compartido exitosamente" 
          : "Tu publicación se ha compartido exitosamente",
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

  const handlePublish = () => {
    // Solo publicar si no estamos creando una encuesta
    if (!showPollCreator) {
      submitPost({});
    }
  };

  // Manejar el toggle de modo idea
  const handleIdeaToggle = () => {
    setIsIdeaMode(prevState => !prevState);
    // Si estamos desactivando el modo idea, limpiamos el contenido
    if (isIdeaMode) {
      setContent("");
    }
  };

  return (
    <Card className="p-4 space-y-4 shadow-sm border-gray-200">
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
        placeholder={isIdeaMode ? "Describe tu idea..." : "¿Qué estás pensando?"}
        isIdeaMode={isIdeaMode}
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
        onIdeaToggle={handleIdeaToggle}
        onPublish={handlePublish}
        isPending={isPending}
        hasContent={!!content || !!file}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        isIdeaMode={isIdeaMode}
      />
    </Card>
  );
}
