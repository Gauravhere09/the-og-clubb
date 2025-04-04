
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface IdeaCreatorProps {
  onIdeaCreate: (ideaData: { title: string; description: string }) => void;
  onCancel: () => void;
}

export function IdeaCreator({ onIdeaCreate, onCancel }: IdeaCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError("El título de la idea es requerido");
      return;
    }
    
    if (!description.trim()) {
      setError("La descripción de la idea es requerida");
      return;
    }
    
    onIdeaCreate({
      title: title.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-medium">Crear una nueva idea</h3>
          <p className="text-sm text-muted-foreground">
            Comparte tu idea para buscar profesionales que te ayuden a realizarla
          </p>
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="Título de la idea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Describe tu idea y qué profesionales necesitas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Crear idea</Button>
        </div>
      </form>
    </div>
  );
}
