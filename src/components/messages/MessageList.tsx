
import { useEffect, useRef, useState } from "react";
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

              <MessageItem 
                message={message} 
                isCurrentUser={isCurrentUser} 
                formattedDate={formattedDate} 
                onDeleteMessage={onDeleteMessage} 
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

// Extract message item to a separate component to manage copy functionality
function MessageItem({ 
  message, 
  isCurrentUser, 
  formattedDate, 
  onDeleteMessage 
}: { 
  message: Message, 
  isCurrentUser: boolean, 
  formattedDate: string,
  onDeleteMessage?: (messageId: string) => void
}) {
  const [isCopying, setIsCopying] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const handleLongPressStart = () => {
    // Check if message contains "Este mensaje ha sido eliminado"
    const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                      message.content === "Este mensaje ha sido eliminado automáticamente" ||
                      message.is_deleted;
                      
    if (isDeleted) return;
    
    // Start a timer for long press
    longPressTimer.current = window.setTimeout(() => {
      setIsCopying(true);
      copyMessageText();
    }, 800); // 800ms for long press
  };

  const handleLongPressEnd = () => {
    // Clear the timer if touch ends
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsCopying(false);
  };

  const copyMessageText = () => {
    const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                      message.content === "Este mensaje ha sido eliminado automáticamente" ||
                      message.is_deleted;
                      
    if (isDeleted) return;
    
    // Create a temporary indicator
    const indicator = document.createElement('div');
    indicator.className = 'copying-indicator active';
    indicator.textContent = 'Mensaje copiado';
    document.body.appendChild(indicator);
    
    // Copy to clipboard
    try {
      navigator.clipboard.writeText(message.content).then(() => {
        console.log('Copied to clipboard');
        
        // Remove the indicator after a delay
        setTimeout(() => {
          indicator.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(indicator);
          }, 200);
        }, 1500);
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isDeleted = message.content === "Este mensaje ha sido eliminado" || 
                    message.content === "Este mensaje ha sido eliminado automáticamente" ||
                    message.is_deleted;

  return (
    <div className={cn(
      "relative group",
      isCurrentUser ? "order-1" : "order-2"
    )}>
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm",
          isDeleted
            ? "bg-muted/50 text-muted-foreground italic"
            : isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
        )}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        <div className={`comment-text-selectable ${isCopying ? 'pulse-on-hold' : ''}`}>
          {message.content}
        </div>
      </div>
      <span className="text-xs text-muted-foreground block mt-1">
        {formattedDate}
      </span>
      
      {/* Opción para eliminar mensaje (solo para mensajes propios no eliminados) */}
      {isCurrentUser && !isDeleted && onDeleteMessage && (
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
  );
}
