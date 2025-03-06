
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Poll } from "@/types/post";
import { VotersList, VoteWithUser } from "./VotersList";

interface VotesDialogProps {
  poll: Poll;
  votes: VoteWithUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadVotes: () => void;
  getPercentage: (votes: number) => number;
}

export function VotesDialog({ 
  poll, 
  votes, 
  open, 
  onOpenChange, 
  onLoadVotes, 
  getPercentage 
}: VotesDialogProps) {
  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        onOpenChange(open);
        if (open) onLoadVotes();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/90 flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver votos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Votos de la encuesta</DialogTitle>
          <DialogDescription>
            Resultados detallados de la votación para "{poll.question}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {poll.options.map((option) => (
            <VotersList 
              key={option.id}
              option={option}
              votes={votes}
              percentage={getPercentage(option.votes || 0)}
            />
          ))}
        </div>
        {votes.length === 0 && (
          <div className="py-6 text-center text-muted-foreground">
            No hay votos registrados en esta encuesta
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
