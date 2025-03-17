
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMentions } from "@/hooks/use-mentions";
import { useToast } from "@/hooks/use-toast";

export function usePostCreator() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [currentUser, setCurrentUser] = useState<{ id: string, avatar_url: string | null, username: string | null } | null>(null);
  const { toast } = useToast();
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
    // Handle poll creation logic
    console.log("Poll created:", pollData);
  };

  const handleSubmitPost = () => {
    // Submit post logic
    console.log("Post submitted");
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

  return {
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
  };
}
