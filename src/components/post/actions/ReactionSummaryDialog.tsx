
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactionSummary } from "../reactions/ReactionSummary";
import { ReactionDetails } from "../reactions/ReactionDetails";
import { Post } from "@/types/post";

interface ReactionSummaryDialogProps {
  reactions: Record<string, number>;
  post: Post;
}

export function ReactionSummaryDialog({ reactions, post }: ReactionSummaryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <ReactionSummary reactions={reactions} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reacciones</DialogTitle>
        </DialogHeader>
        <ReactionDetails post={post} />
      </DialogContent>
    </Dialog>
  );
}
