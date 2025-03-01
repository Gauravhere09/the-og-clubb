
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";
import { ChatHeader } from "@/components/messages/ChatHeader";
import { GroupChat } from "@/components/messages/GroupChat";
import { Message } from "@/hooks/use-private-messages";
import { Friend } from "@/hooks/use-friends";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  showChat: boolean;
  showGroupChat: boolean;
  selectedFriend: Friend | null;
  currentUserId: string | null;
  messages: Message[];
  groupMessages: any[];
  newMessage: string;
  isTyping: boolean;
  onBack: () => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onImageUpload?: (file: File) => void;
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
  onImageUpload
}: ChatContainerProps) => {
  const isMobile = useIsMobile();

  if (!showChat) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center p-4 text-center text-muted-foreground bg-gray-50 dark:bg-[#111]">
        <p className="text-lg font-medium mb-2">Selecciona un chat para comenzar a conversar</p>
        <p className="text-sm">O inicia una nueva conversación desde el chat grupal</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full flex-1 bg-gray-50 dark:bg-[#111] ${isMobile && (showGroupChat || selectedFriend) ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <ChatHeader
        selectedFriend={selectedFriend}
        isGroupChat={showGroupChat}
        onBack={onBack}
      />

      {showGroupChat ? (
        <GroupChat
          messages={groupMessages}
          currentUserId={currentUserId || ""}
          onSendMessage={async (content, type, audioBlob) => {
            // Adaptamos esta función para cumplir con los requisitos del componente GroupChat
            console.log("Enviando mensaje grupal:", content, type);
            onSendMessage();
          }}
        />
      ) : (
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          onDeleteMessage={onDeleteMessage}
        />
      )}

      {isTyping && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Escribiendo...
        </div>
      )}

      {!showGroupChat && (
        <MessageInput
          newMessage={newMessage}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onImageUpload={onImageUpload}
        />
      )}
    </div>
  );
};
