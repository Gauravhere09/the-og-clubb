
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useState, useEffect } from "react";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { Friend } from "@/hooks/use-friends";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    if (isOpen && currentUserId && targetUser) {
      const friend: Friend = {
        id: targetUser.id,
        username: targetUser.username,
        avatar_url: targetUser.avatar_url,
        friend_id: targetUser.id,
        friend_username: targetUser.username,
        friend_avatar_url: targetUser.avatar_url,
        status: 'friends'
      };
      loadMessages(currentUserId, friend);
    }

    // Hide navigation when chat is open on mobile
    const nav = document.querySelector('nav');
    if (nav) {
      if (isOpen && window.innerWidth < 768) {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
      }
    }

    return () => {
      // Restore navigation when chat is closed
      const nav = document.querySelector('nav');
      if (nav) {
        nav.style.display = 'flex';
      }
    };
  }, [isOpen, currentUserId, targetUser, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const friend: Friend = {
      id: targetUser.id,
      username: targetUser.username,
      avatar_url: targetUser.avatar_url,
      friend_id: targetUser.id,
      friend_username: targetUser.username,
      friend_avatar_url: targetUser.avatar_url,
      status: 'friends'
    };

    console.log("Sending message to:", targetUser.username, "with ID:", targetUser.id);
    const success = await sendMessage(newMessage, currentUserId, friend);
    
    if (success) {
      setNewMessage("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId, currentUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 h-[100dvh] md:h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${targetUser.id}`} onClick={onClose}>
              <Avatar className="hover:opacity-80 transition-opacity">
                <AvatarImage src={targetUser.avatar_url || undefined} />
                <AvatarFallback>{targetUser.username?.[0] || '?'}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="font-medium">
              <Link 
                to={`/profile/${targetUser.id}`} 
                className="hover:underline"
                onClick={() => onClose()}
              >
                {targetUser.username || "Usuario"}
              </Link>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={handleDeleteMessage}
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
