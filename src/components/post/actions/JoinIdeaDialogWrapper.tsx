
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinIdeaDialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profession: string;
  setProfession: (value: string) => void;
  onJoin: () => Promise<void>;
  ideaTitle?: string;
}

export function JoinIdeaDialogWrapper({
  isOpen,
  onOpenChange,
  profession,
  setProfession,
  onJoin,
  ideaTitle
}: JoinIdeaDialogWrapperProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unirse a la idea: {ideaTitle}</DialogTitle>
          <DialogDescription>
            Comparte tu profesión para que el creador de la idea sepa cómo puedes contribuir.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Tu profesión o habilidad"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onJoin}>
            Unirme a la idea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
