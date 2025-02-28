
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useState, useEffect, useRef } from "react";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { Friend } from "@/hooks/use-friends";
import { X, Phone, Video, MoreVertical, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { uploadProfileImage } from "@/lib/api/profile";
import { useToast } from "@/hooks/use-toast";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  currentUserId: string;
}

export const ChatDialog = ({ isOpen, onClose, targetUser, currentUserId }: ChatDialogProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const { messages, loadMessages, sendMessage } = usePrivateMessages();
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && currentUserId && targetUser) {
      const friend: Friend = {
        friend_id: targetUser.id,
        friend_username: targetUser.username,
        friend_avatar_url: targetUser.avatar_url,
        status: 'accepted'
      };
      
      // Corrigiendo el problema - pasando ambos argumentos a loadMessages
      loadMessages(currentUserId, friend);
      setLastActivity(new Date());

      // Ocultar la navegación cuando el chat está abierto en móvil
      const nav = document.querySelector('nav');
      if (nav && window.innerWidth < 768) {
        nav.style.display = 'none';
      }
    }

    return () => {
      // Restaurar la navegación cuando se cierra el chat
      const nav = document.querySelector('nav');
      if (nav) {
        nav.style.display = 'flex';
      }
    };
  }, [isOpen, currentUserId, targetUser, loadMessages]);

  // Simular el estado de "typing" para una mejor experiencia de usuario
  useEffect(() => {
    if (Math.random() > 0.7 && isOpen) {
      const typingDelay = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000 + Math.random() * 3000);
      }, 1000 + Math.random() * 5000);
      
      return () => clearTimeout(typingDelay);
    }
  }, [messages, isOpen]);

  // Scroll al final de los mensajes cuando llegan nuevos
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const friend: Friend = {
      friend_id: targetUser.id,
      friend_username: targetUser.username,
      friend_avatar_url: targetUser.avatar_url,
      status: 'accepted'
    };

    const success = await sendMessage(newMessage, currentUserId, friend);
    if (success) {
      setNewMessage("");
      setLastActivity(new Date());
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsFileUploading(true);
    try {
      const imageUrl = await uploadProfileImage(file);
      
      const friend: Friend = {
        friend_id: targetUser.id,
        friend_username: targetUser.username,
        friend_avatar_url: targetUser.avatar_url,
        status: 'accepted'
      };
      
      // Enviar mensaje con imagen
      const success = await sendMessage(`![imagen](${imageUrl})`, currentUserId, friend);
      
      if (success) {
        toast({
          title: "Imagen enviada",
          description: "Tu imagen se ha enviado correctamente",
        });
        setLastActivity(new Date());
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen",
      });
    } finally {
      setIsFileUploading(false);
    }
  };

  // Obtener la última vez activo en formato legible
  const getLastActiveText = () => {
    if (!lastActivity) return "En línea";
    
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "En línea ahora";
    if (diffMins < 60) return `Activo hace ${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `Activo hace ${hours} h`;
    
    return "Activo recientemente";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 h-[100dvh] md:h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10 bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-primary/10">
              <AvatarImage src={targetUser.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                {targetUser.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{targetUser.username}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                {isTyping ? (
                  <span className="flex items-center">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Escribiendo...
                  </span>
                ) : (
                  getLastActiveText()
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gradient-to-b from-muted/50 to-muted/30 px-4 py-2">
          <MessageList 
            messages={messages}
            currentUserId={currentUserId}
          />
          <div ref={messageEndRef} />
        </div>

        {isTyping && (
          <div className="px-4 py-2">
            <motion.div 
              className="bg-muted/50 p-2 rounded-lg inline-flex items-center text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-1 mx-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          </div>
        )}

        <MessageInput 
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onImageUpload={handleImageUpload}
          isLoading={isFileUploading}
        />
      </DialogContent>
    </Dialog>
  );
};
