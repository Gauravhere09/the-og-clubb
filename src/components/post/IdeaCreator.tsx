
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface IdeaCreatorProps {
  onIdeaCreate: (ideaData: { description: string }) => void;
  onCancel: () => void;
}

export function IdeaCreator({ onIdeaCreate, onCancel }: IdeaCreatorProps) {
  const [description, setDescription] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    onIdeaCreate({ description });
  };
  
  return (
    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Crear una idea</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe tu idea..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={!description.trim()}
          >
            Publicar idea
          </Button>
        </div>
      </form>
    </div>
  );
}
