
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentButtonProps {
  onToggleComments: () => void;
  isExpanded?: boolean;
}

export function CommentButton({ onToggleComments, isExpanded = false }: CommentButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex-1 ${isExpanded ? 'text-primary dark:text-primary' : 'text-foreground dark:text-white'}`}
      onClick={onToggleComments}
    >
      <MessagesSquare className={`h-4 w-4 mr-2 ${isExpanded ? 'text-primary dark:text-primary' : 'text-foreground dark:text-white'}`} />
      Comentar
    </Button>
  );
}
