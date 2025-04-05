
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (profession: string) => void;
  ideaTitle?: string;
}

export function JoinIdeaDialog({ 
  isOpen, 
  onOpenChange, 
  onJoin, 
  ideaTitle 
}: JoinIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profession.trim()) return;
    
    setIsLoading(true);
    try {
      await onJoin(profession);
      setProfession("");
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Únete a esta idea</DialogTitle>
        </DialogHeader>
        
        {ideaTitle && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">Idea: {ideaTitle}</p>
            <p className="text-muted-foreground">Estás a punto de unirte a esta iniciativa.</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="profession">¿Cuál es tu profesión o habilidad?</Label>
            <Input
              id="profession"
              placeholder="Ej: Desarrollador web, Diseñador UX/UI, Marketing..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ayuda a los demás participantes a saber qué puedes aportar a la idea.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!profession.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Uniéndome..." : "Unirme a la idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
