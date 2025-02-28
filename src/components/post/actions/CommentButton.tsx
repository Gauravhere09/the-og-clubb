
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentButtonProps {
  onToggleComments: () => void;
}

export function CommentButton({ onToggleComments }: CommentButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex-1"
      onClick={onToggleComments}
    >
      <MessagesSquare className="h-4 w-4 mr-2" />
      Comentar
    </Button>
  );
}
