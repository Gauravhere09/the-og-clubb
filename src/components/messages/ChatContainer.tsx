
import { GroupChat } from "./GroupChat";
import { ChatDialog } from "./ChatDialog";
import { ChatHeader } from "./ChatHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Friend } from "@/hooks/use-friends";
import { Message } from "@/hooks/use-private-messages";
import { GroupMessage } from "@/hooks/use-group-messages";

interface ChatContainerProps {
  showChat: boolean;
  showGroupChat: boolean;
  selectedFriend: Friend | null;
  currentUserId: string | null;
  messages: Message[];
  groupMessages: GroupMessage[];
  newMessage: string;
  isTyping: boolean;
  onBack: () => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onDeleteMessage: (messageId: string) => void;
  onImageUpload: (file: File) => Promise<void>;
  onSendGroupMessage: (content: string, type: 'text' | 'audio' | 'image', mediaBlob?: Blob) => Promise<void>;
}

export const ChatContainer = ({
  showChat,
  showGroupChat,
  selectedFriend,
  currentUserId,
  messages,
  groupMessages,
  newMessage,
  isTyping,
  onBack,
  onMessageChange,
  onSendMessage,
  onDeleteMessage,
  onImageUpload,
  onSendGroupMessage
}: ChatContainerProps) => {
  if (!showChat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-muted-foreground">
        <p>Selecciona un chat para comenzar a conversar</p>
      </div>
    );
  }

  if (showGroupChat) {
    return (
      <GroupChat
        messages={groupMessages}
        currentUserId={currentUserId || ""}
        onSendMessage={onSendGroupMessage}
        onClose={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader friend={selectedFriend} onBack={onBack} />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onDeleteMessage={onDeleteMessage}
      />
      <MessageInput
        newMessage={newMessage}
        isTyping={isTyping}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onImageUpload={onImageUpload}
      />
      {/* Since we're not using the dialog functionality in this component,
          we'll remove it from here. If it's needed, it should be properly
          configured with all required props. */}
    </div>
  );
};
