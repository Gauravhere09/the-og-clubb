
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface JoinIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (profession: string) => Promise<void>;
  ideaTitle: string;
}

export function JoinIdeaDialog({ isOpen, onOpenChange, onJoin, ideaTitle }: JoinIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!profession.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar tu profesión",
      });
      return;
    }

    try {
      await onJoin(profession.trim());
      setProfession(""); // Reset the input after successful join
    } catch (error) {
      // Error will be handled by the parent component
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
          <Button onClick={handleJoin}>
            Unirme a la idea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
