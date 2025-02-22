
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { useState, useEffect } from "react";
import { usePrivateMessages } from "@/hooks/use-private-messages";
import { Friend } from "@/hooks/use-friends";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { messages, loadMessages, sendMessage } = usePrivateMessages();

  useEffect(() => {
    if (isOpen && currentUserId && targetUser) {
      const friend: Friend = {
        friend_id: targetUser.id,
        friend_username: targetUser.username,
        friend_avatar_url: targetUser.avatar_url,
        status: 'accepted'
      };
      loadMessages(currentUserId, friend);
    }
  }, [isOpen, currentUserId, targetUser]);

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 h-[600px] flex flex-col bg-background">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={targetUser.avatar_url || undefined} />
              <AvatarFallback>{targetUser.username[0]}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{targetUser.username}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <MessageList 
          messages={messages}
          currentUserId={currentUserId}
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
