
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api";
import { PollCreator } from "./post/PollCreator";
import { PostActionButtons } from "./post/PostActionButtons";
import { FilePreview } from "./post/FilePreview";
import { VisibilitySelector } from "./post/VisibilitySelector";
import { AtSign } from "lucide-react";
import { useMentions } from "@/hooks/mentions";
import { MentionSuggestions } from "./mentions/MentionSuggestions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export function PostCreator() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [currentUser, setCurrentUser] = useState<{ id: string, avatar_url: string | null, username: string | null } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextChange,
    insertMention,
    setMentionListVisible
  } = useMentions();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Usuario autenticado:", user.id);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error al obtener perfil:", error);
            return;
          }
          
          if (profile) {
            console.log("Perfil obtenido:", profile);
            setCurrentUser({
              id: user.id,
              avatar_url: profile.avatar_url,
              username: profile.username
            });
          }
        }
      } catch (error) {
        console.error("Error en fetchCurrentUser:", error);
      }
    };

    fetchCurrentUser();
  }, []);

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

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 50MB.",
      });
      return;
    }
    setFile(selectedFile);
  };

  const handlePollCreate = (pollData: { question: string; options: string[] }) => {
    submitPost(pollData);
  };

  const handleSubmitPost = () => {
    submitPost(undefined); // Pasamos undefined cuando no hay datos de encuesta
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    if (textareaRef.current) {
      handleTextChange(value, textareaRef.current.selectionStart, textareaRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention selection with keyboard navigation
    if (mentionListVisible && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev <= 0 ? mentionUsers.length - 1 : prev - 1));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionIndex >= 0 && mentionIndex < mentionUsers.length) {
          const newText = insertMention(content, mentionUsers[mentionIndex]);
          setContent(newText);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMentionListVisible(false);
      }
    }
  };

  const handleSelectMention = (user: any) => {
    const newText = insertMention(content, user);
    setContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleMentionClick = () => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      const textAfter = content.substring(cursorPos);
      
      // Insertamos @ en la posición del cursor
      const newContent = textBefore + '@' + textAfter;
      setContent(newContent);
      
      // Enfocamos el textarea y movemos el cursor a la posición después del @
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-10 w-10 border-2 border-primary/10">
          <AvatarImage 
            src={currentUser?.avatar_url || undefined} 
            alt={currentUser?.username || "Usuario"}
            onError={(e) => {
              console.log("Error cargando imagen:", e);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none'; // Ocultar imagen en error
            }}
          />
          <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="¿Qué estás pensando?"
            value={content}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            className="resize-none rounded-full pl-4 pr-12 py-2 min-h-0 h-10 focus-visible:h-20 transition-all duration-200 bg-muted/50"
          />
          
          <MentionSuggestions
            users={mentionUsers}
            isVisible={mentionListVisible}
            position={mentionPosition}
            selectedIndex={mentionIndex}
            onSelectUser={handleSelectMention}
            onSetIndex={setMentionIndex}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleMentionClick}
          className="text-sm flex items-center gap-1"
        >
          <AtSign className="h-4 w-4" />
          Mencionar a alguien
        </Button>
        
        <VisibilitySelector 
          visibility={visibility} 
          onVisibilityChange={setVisibility} 
        />
      </div>
      
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
      
      <div className="flex items-center justify-between">
        <PostActionButtons 
          onFileSelect={handleFileChange}
          onPollCreate={() => setShowPollCreator(true)}
          isPending={isPending}
        />
        <Button 
          onClick={handleSubmitPost}
          disabled={isPending || (!content && !file)}
        >
          Publicar
        </Button>
      </div>
    </Card>
  );
}
