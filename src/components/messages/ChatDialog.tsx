
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
      friend_id: targetUser.id,
      friend_username: targetUser.username,
      friend_avatar_url: targetUser.avatar_url,
      status: 'friends'
    };

    const success = await sendMessage(newMessage, currentUserId, friend);
    if (success) {
      setNewMessage("");
      
      try {
        // First check if there's an existing friendship between these users
        const { data: existingFriendship, error: checkError } = await supabase
          .from('friends')
          .select('id')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUser.id}),and(user_id.eq.${targetUser.id},friend_id.eq.${currentUserId})`)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking friendship:", checkError);
        }
        
        // If no friendship exists, create one in both directions
        if (!existingFriendship) {
          // Get the current user's profile info to store in the other user's friendship entry
          const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', currentUserId)
            .single();
          
          if (currentUserProfile) {
            // Create friendship entries in both directions for full visibility
            await supabase.from('friends').insert([
              { 
                user_id: currentUserId, 
                friend_id: targetUser.id,
                friend_username: targetUser.username
              }
            ]);
            
            await supabase.from('friends').insert([
              { 
                user_id: targetUser.id, 
                friend_id: currentUserId,
                friend_username: currentUserProfile.username
              }
            ]);
            
            console.log("Created new friendship relation");
            
            // Notificar al usuario que el chat ha sido añadido a su lista
            toast({
              title: "Chat añadido",
              description: `Se ha añadido un nuevo chat con ${targetUser.username}`,
            });
          }
        }
      } catch (error) {
        console.error("Error managing friendship for chat:", error);
      }
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
