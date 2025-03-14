
import React, { useEffect, useRef } from "react";
import { Message } from "@/types/messages";
import { MessageItem } from "./MessageItem";
import { Skeleton } from "@/components/ui/skeleton";

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (messageId: string) => Promise<void>;
  isLoading?: boolean; // Add the isLoading prop
}

export function MessageList({ messages, currentUserId, onDeleteMessage, isLoading = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'} rounded-lg p-3`}>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 pt-0">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
          onDelete={onDeleteMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
