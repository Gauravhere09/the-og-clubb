
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useState, useEffect } from "react";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { Friend } from "@/hooks/use-friends";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ChatDialogProps {
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
  const { messages, loadMessages, sendMessage, deleteMessage } = usePrivateMessages();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUserId && targetUser) {
      setIsLoading(true);
      const friend: Friend = {
        friend_id: targetUser.id,
        friend_username: targetUser.username || "Usuario",
        friend_avatar_url: targetUser.avatar_url,
        status: 'friends'
      };
      
      loadMessages(currentUserId, friend)
        .finally(() => setIsLoading(false));
    }

    // Ocultar la navegación cuando el chat está abierto en móvil
    const nav = document.querySelector('nav');
    if (nav) {
      if (isOpen && window.innerWidth < 768) {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!currentUserId) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para enviar mensajes",
          variant: "destructive",
        });
        return;
      }
    }

    const friend: Friend = {
      friend_id: targetUser.id,
      friend_username: targetUser.username || "Usuario",
      friend_avatar_url: targetUser.avatar_url,
      status: 'friends'
    };

    try {
      const success = await sendMessage(newMessage, currentUserId, friend);
      if (success) {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId, currentUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 h-[100dvh] md:h-[600px] flex flex-col bg-background chat-dialog">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={targetUser.avatar_url || undefined} />
              <AvatarFallback>{targetUser.username?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{targetUser.username || "Usuario"}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={handleDeleteMessage}
          isLoading={isLoading}
        />

        <MessageInput 
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      </DialogContent>
    </Dialog>
  );
};
