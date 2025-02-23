
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
      <div className="space-y-2 py-4">
        {messages.map((message) => {
          const isSender = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[65%] rounded-lg p-3 ${
                  isSender
                    ? "bg-[#005C4B]"
                    : "bg-[#1F2C33]"
                }`}
              >
                <p className="text-white">{message.content}</p>
                <div className="text-xs text-gray-400 mt-1 flex justify-end">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
