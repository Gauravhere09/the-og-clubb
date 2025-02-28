
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

  // Función para agrupar mensajes por fecha
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };
  
  // Agrupar mensajes por fecha
  const groupedMessages = groupMessagesByDate(messages);
  
  // Verificar si un mensaje es el primero de un grupo de mensajes del mismo remitente
  const isFirstInGroup = (message: Message, index: number, arr: Message[]) => {
    if (index === 0) return true;
    return message.sender_id !== arr[index - 1].sender_id;
  };
  
  // Verificar si un mensaje es el último de un grupo de mensajes del mismo remitente
  const isLastInGroup = (message: Message, index: number, arr: Message[]) => {
    if (index === arr.length - 1) return true;
    return message.sender_id !== arr[index + 1].sender_id;
  };

  // Detectar si el mensaje contiene una URL de imagen para mostrarla
  const isImageMessage = (content: string) => {
    return content.startsWith('![imagen](') && content.endsWith(')');
  };

  const extractImageUrl = (content: string) => {
    if (isImageMessage(content)) {
      return content.substring(10, content.length - 1);
    }
    return null;
  };

  return (
    <ScrollArea className="flex-1 px-2 md:px-4 hide-scrollbar" ref={scrollRef}>
      <div className="space-y-6 py-4">
        <AnimatePresence>
          {groupedMessages.map(({ date, messages: groupMessages }, groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {formatDate(date)}
                </div>
              </div>
              
              {groupMessages.map((message, index) => {
                const isSender = message.sender_id === currentUserId;
                const firstInGroup = isFirstInGroup(message, index, groupMessages);
                const lastInGroup = isLastInGroup(message, index, groupMessages);
                const imageUrl = extractImageUrl(message.content);
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-end gap-2",
                      isSender ? "justify-end" : "justify-start",
                      !firstInGroup && "mt-1"
                    )}
                  >
                    {!isSender && firstInGroup && (
                      <Avatar className="h-6 w-6 mb-4">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {!isSender && !firstInGroup && <div className="w-6" />}
                    
                    <div
                      className={cn(
                        "max-w-[65%] px-3 py-2",
                        isSender
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted dark:bg-[#222E35] border border-muted/10 dark:border-[#313D45] text-foreground",
                        firstInGroup && !isSender && "rounded-tl-md",
                        firstInGroup && isSender && "rounded-tr-md",
                        lastInGroup && !isSender && "rounded-bl-md",
                        lastInGroup && isSender && "rounded-br-md",
                        !isSender && "rounded-tr-2xl rounded-br-2xl",
                        isSender && "rounded-tl-2xl rounded-bl-2xl"
                      )}
                    >
                      {imageUrl ? (
                        <div className="mb-1">
                          <img 
                            src={imageUrl} 
                            alt="Imagen compartida" 
                            className="max-w-full rounded-md object-cover"
                            onLoad={() => {
                              if (scrollRef.current) {
                                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <p className="break-words whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div className={cn(
                        "text-[10px] mt-1 flex justify-end",
                        isSender ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
