
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IdeaParticipant } from "@/types/post";

interface ParticipantsListProps {
  participants: IdeaParticipant[];
}

export function ParticipantsList({ participants }: ParticipantsListProps) {
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {participants.slice(0, 3).map((participant, index) => (
              <Avatar key={index} className="border-2 border-background w-8 h-8">
                <AvatarImage src={participant.avatar_url} />
                <AvatarFallback>{participant.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs">
                +{participants.length - 3}
              </div>
            )}
          </div>
          <span className="ml-3 text-sm text-muted-foreground">
            {participants.length === 0
              ? "Sé el primero en unirte"
              : participants.length === 1
              ? "1 participante"
              : `${participants.length} participantes`}
          </span>
        </div>
        
        {participants.length > 0 && (
          <Button 
            variant="link" 
            onClick={() => setShowParticipants(true)}
            className="text-sm p-0 h-auto"
          >
            Ver participantes
          </Button>
        )}
      </div>

      {/* Diálogo para mostrar participantes */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Participantes</DialogTitle>
            <DialogDescription>
              Personas que se han unido a esta idea
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            <ul className="space-y-3">
              {participants.map((participant, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>{participant.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{participant.username || "Usuario"}</span>
                    <span className="text-xs text-muted-foreground">{participant.profession}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
