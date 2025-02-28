
import { useEffect, useRef } from "react";
import { Message } from "@/hooks/use-private-messages";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, onDeleteMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages.length) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <p>No hay mensajes aún</p>
          <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-4 py-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const formattedDate = formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: es
          });

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-2 max-w-[80%]",
                isCurrentUser ? "ml-auto" : "mr-auto"
              )}
            >
              {!isCurrentUser && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}

              <div className={cn(
                "relative group",
                isCurrentUser ? "order-1" : "order-2"
              )}>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground block mt-1">
                  {formattedDate}
                </span>
                
                {/* Opción para eliminar mensaje (solo para mensajes propios) */}
                {isCurrentUser && onDeleteMessage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4 text-primary-foreground hover:text-white" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => onDeleteMessage(message.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Eliminar mensaje
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
