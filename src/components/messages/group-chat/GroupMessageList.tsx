
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupMessageItem } from "./GroupMessageItem";
import type { GroupMessage } from "@/hooks/use-group-messages";

interface GroupMessageListProps {
  messages: GroupMessage[];
  currentUserId: string;
}

export const GroupMessageList = ({ messages, currentUserId }: GroupMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay mensajes aún. ¡Sé el primero en enviar uno!
          </div>
        ) : (
          messages.map((message) => (
            <GroupMessageItem 
              key={message.id} 
              message={message} 
              currentUserId={currentUserId} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
