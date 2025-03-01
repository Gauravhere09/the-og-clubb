
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { GroupMessage } from "@/hooks/use-group-messages";

interface GroupMessageItemProps {
  message: GroupMessage;
  currentUserId: string;
}

export const GroupMessageItem = ({ message, currentUserId }: GroupMessageItemProps) => {
  const { toast } = useToast();
  const isCurrentUser = message.sender_id === currentUserId;

  const handleDeleteMessage = async () => {
    try {
      // Verificar que el mensaje pertenece al usuario actual
      if (message.sender_id !== currentUserId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
      }
      
      // Eliminar el mensaje
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', message.id);
        
      if (error) throw error;
      
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado con éxito",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el mensaje",
      });
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className="flex gap-2">
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar_url || undefined} />
            <AvatarFallback>{message.sender?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        )}
        <div className="relative group">
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              isCurrentUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {message.type === 'audio' ? (
              <audio src={message.media_url || undefined} controls className="max-w-[200px]" />
            ) : message.type === 'image' ? (
              <img src={message.media_url || undefined} alt="Imagen enviada" className="max-w-[200px] rounded" />
            ) : (
              <p>{message.content}</p>
            )}
            <div
              className={`text-xs mt-1 ${
                isCurrentUser 
                  ? "text-primary-foreground/70" 
                  : "text-muted-foreground"
              }`}
            >
              {message.sender?.username || 'Usuario'} • {new Date(message.created_at).toLocaleTimeString()}
            </div>
          </div>
          
          {/* Opción para eliminar mensaje (solo para mensajes propios) */}
          {isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className={`h-4 w-4 ${
                  isCurrentUser 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                }`} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleDeleteMessage}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar mensaje
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};
