
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const lastSeenMessageRef = useRef<string | null>(null);

  // Detectar cuándo el usuario ha visto el último mensaje
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Si el último mensaje ya es visible en el área de scroll
      if (scrollRef.current) {
        const scrollContainer = scrollRef.current;
        const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;
        
        if (isScrolledToBottom) {
          lastSeenMessageRef.current = lastMessage.id;
          setUnseenCount(0);
        } else if (lastSeenMessageRef.current !== lastMessage.id) {
          // Si hay mensajes nuevos que no han sido vistos
          setUnseenCount(prev => prev + 1);
        }
      }
    }
  }, [messages]);

  // Auto-scroll al último mensaje solo cuando el component se monta inicialmente
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      lastSeenMessageRef.current = messages[messages.length - 1].id;
    }
  }, []);

  // Controlar mostrar/ocultar botón de scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isScrolledUp = scrollHeight - scrollTop > clientHeight + 100;
      setShowScrollButton(isScrolledUp);
      
      // Si el usuario scrollea hasta abajo, marcar todos los mensajes como vistos
      if (scrollHeight - scrollTop <= clientHeight + 50 && messages.length > 0) {
        lastSeenMessageRef.current = messages[messages.length - 1].id;
        setUnseenCount(0);
      }
    }
  };

  // Función para hacer scroll hasta abajo
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowScrollButton(false);
      
      if (messages.length > 0) {
        lastSeenMessageRef.current = messages[messages.length - 1].id;
        setUnseenCount(0);
      }
    }
  };

  // Agrupar mensajes por fecha
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="relative h-full">
      <ScrollArea className="h-full px-4" ref={scrollRef} onScroll={handleScroll}>
        <div className="space-y-4 py-4">
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-2">
              <div className="flex justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-background/60 px-2 py-1 rounded-full">
                  {formatMessageDate(date)}
                </span>
              </div>
              {msgs.map((message) => {
                const isSender = message.sender_id === currentUserId;
                const isMarkdown = message.content.startsWith('![');
                const isImage = isMarkdown && message.content.includes('](') && message.content.endsWith(')');
                
                let content = message.content;
                let imageUrl = '';
                
                if (isImage) {
                  const matches = message.content.match(/!\[(.*?)\]\((.*?)\)/);
                  if (matches && matches.length > 2) {
                    imageUrl = matches[2];
                  }
                }
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`max-w-[65%] rounded-lg p-3 ${
                              isSender
                                ? "bg-[#9b87f5] dark:bg-[#6E59A5]"
                                : "bg-white dark:bg-[#111B21] border border-gray-200 dark:border-[#313D45]"
                            }`}
                          >
                            {isImage ? (
                              <img 
                                src={imageUrl} 
                                alt="Imagen compartida" 
                                className="max-w-full rounded-md" 
                                loading="lazy"
                              />
                            ) : (
                              <p className={`${isSender ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                {content}
                              </p>
                            )}
                            <div className={`text-xs ${isSender ? "text-white/70" : "text-gray-500 dark:text-gray-400"} mt-1 flex justify-end`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true,
                            locale: es
                          })}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-2 shadow-lg flex items-center gap-1"
            onClick={scrollToBottom}
          >
            {unseenCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px]">
                {unseenCount}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7 7 7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Función para agrupar mensajes por fecha
function groupMessagesByDate(messages: Message[]) {
  return messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
}

// Función para mostrar fecha formateada
function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
