
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Poll } from "@/types/post";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PollDisplayProps {
  postId: string;
  poll: Poll;
  onVote: (optionId: string) => Promise<void>;
}

export function PollDisplay({ postId, poll, onVote }: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.user_vote);
  const [isVoting, setIsVoting] = useState(false);
  const [showVotesDialog, setShowVotesDialog] = useState(false);
  const { toast } = useToast();

  const handleVote = async (optionId: string) => {
    if (poll.user_vote || isVoting) return;
    
    setIsVoting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para votar");

      // Insertar el voto en la tabla poll_votes
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          post_id: postId,
          user_id: user.id,
          option_id: optionId
        });

      if (voteError) throw voteError;

      await onVote(optionId);
      setSelectedOption(optionId);
      
      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado correctamente",
      });

    } catch (error: any) {
      console.error('Error al votar:', error);
      toast({
        variant: "destructive",
        title: "Error al votar",
        description: error.message || "No se pudo registrar tu voto",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((votes / poll.total_votes) * 100);
  };

  return (
    <div className="space-y-4 mt-4 bg-background rounded-lg p-4">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {poll.question}
        </h3>
        {!poll.user_vote && (
          <p className="text-sm text-muted-foreground">
            Selecciona una opción.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = option.id === selectedOption;
          const hasVoted = poll.user_vote !== null;

          return (
            <div
              key={option.id}
              className="relative"
            >
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={cn(
                  "w-full text-left p-4 rounded-lg transition-all relative overflow-hidden",
                  "group flex items-center justify-between",
                  hasVoted ? "bg-primary/10" : "hover:bg-primary/5",
                  isSelected && "bg-primary/20"
                )}
              >
                <div className="flex items-center gap-3 z-10">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={cn(
                    "font-medium",
                    isSelected && "text-primary"
                  )}>
                    {option.content}
                  </span>
                </div>
                {hasVoted && (
                  <span className="text-sm font-medium z-10">
                    {percentage}% ({option.votes || 0})
                  </span>
                )}
                {hasVoted && (
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-lg bg-primary/5",
                      isSelected && "bg-primary/10"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {poll.user_vote && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>{poll.total_votes} {poll.total_votes === 1 ? "voto" : "votos"}</span>
          <Dialog open={showVotesDialog} onOpenChange={setShowVotesDialog}>
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
                <DialogTitle>Detalle de votos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{option.content}</span>
                      <span className="font-medium">
                        {option.votes} {option.votes === 1 ? "voto" : "votos"} ({getPercentage(option.votes)}%)
                      </span>
                    </div>
                    <Progress value={getPercentage(option.votes)} className="h-2" />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground pt-2">
                  Total: {poll.total_votes} {poll.total_votes === 1 ? "voto" : "votos"}
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
