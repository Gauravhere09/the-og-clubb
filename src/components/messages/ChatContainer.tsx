
import { Friend } from "@/hooks/use-friends";
import { GroupMessage } from "@/hooks/use-group-messages";
import { GroupChat } from "./GroupChat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatContainerProps {
  showChat: boolean;
  showGroupChat: boolean;
  selectedFriend: Friend | null;
  currentUserId: string | null;
  messages: any[];
  groupMessages: GroupMessage[];
  newMessage: string;
  isTyping: boolean;
  onBack: () => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
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
}: ChatContainerProps) => {
  if (!showChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Selecciona un chat para comenzar
      </div>
    );
  }

  if (showGroupChat && currentUserId) {
    return (
      <GroupChat
        messages={groupMessages}
        currentUserId={currentUserId}
        onSendMessage={async () => {}}
        onClose={() => {
          onBack();
          const nav = document.querySelector('nav');
          if (nav) nav.style.display = 'flex';
        }}
      />
    );
  }

  if (selectedFriend) {
    return (
      <>
        <ChatHeader 
          friend={selectedFriend} 
          onBack={() => {
            onBack();
            const nav = document.querySelector('nav');
            if (nav) nav.style.display = 'flex';
          }}
          isTyping={isTyping}
        />
        {currentUserId && (
          <>
            <MessageList 
              messages={messages}
              currentUserId={currentUserId}
            />
            <MessageInput 
              newMessage={newMessage}
              onMessageChange={onMessageChange}
              onSendMessage={onSendMessage}
            />
          </>
        )}
      </>
    );
  }

  return null;
};
