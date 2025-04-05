
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (profession: string) => Promise<void>;
  ideaTitle?: string;
}

export function JoinIdeaDialog({
  isOpen,
  onOpenChange,
  onJoin,
  ideaTitle
}: JoinIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!profession.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onJoin(profession);
      setProfession("");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Button 
            onClick={handleSubmit}
            disabled={!profession.trim() || isSubmitting}
          >
            {isSubmitting ? "Uniéndose..." : "Unirme a la idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
