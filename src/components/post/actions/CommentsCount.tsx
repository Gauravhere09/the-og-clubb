
import { Button } from "@/components/ui/button";

interface CommentsCountProps {
  count: number;
  onClick: () => void;
}

export function CommentsCount({ count, onClick }: CommentsCountProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0"
      onClick={onClick}
    >
      {count} {count === 1 ? "comentario" : "comentarios"}
    </Button>
  );
}
