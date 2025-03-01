
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface GroupChatHeaderProps {
  messagesCount: number;
  onClose?: () => void;
}

export const GroupChatHeader = ({ messagesCount, onClose }: GroupChatHeaderProps) => {
  return (
    <div className="p-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[#9b87f5]">H</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">Red H</h2>
          <p className="text-xs text-muted-foreground">Chat grupal ({messagesCount} mensajes)</p>
        </div>
      </div>
      {onClose && (
        <Button variant="ghost" size="sm" onClick={onClose}>
          Volver
        </Button>
      )}
    </div>
  );
};
