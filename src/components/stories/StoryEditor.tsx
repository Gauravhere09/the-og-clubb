
import { Button } from "@/components/ui/button";
import { 
  X, 
  Wand2, 
  Pencil, 
  Music, 
  UserPlus, 
  Volume2, 
  Cog, 
  ChevronRight 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoryVisibility } from "./utils/story-utils";

interface StoryEditorProps {
  previewUrl: string;
  visibility: StoryVisibility;
  onVisibilityChange: (value: StoryVisibility) => void;
  onClose: () => void;
  onSubmit: () => void;
  isUploading: boolean;
}

export function StoryEditor({ 
  previewUrl, 
  visibility, 
  onVisibilityChange, 
  onClose,
  onSubmit,
  isUploading
}: StoryEditorProps) {
  return (
    <div className="relative h-full flex flex-col bg-black">
      <div className="flex justify-between items-center p-4 text-white">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </Button>
        <div className="font-semibold">
          Editar historia
        </div>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="flex-1 relative">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-contain" 
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-5">
          <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
            <Wand2 className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
            <Pencil className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
            <Music className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
            <UserPlus className="h-6 w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full bg-gray-800 text-white">
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="p-4 bg-black text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 text-white">
              <Cog className="h-6 w-6" />
            </Button>
            <span>Privacidad</span>
          </div>
          <Select value={visibility} onValueChange={(value) => onVisibilityChange(value as StoryVisibility)}>
            <SelectTrigger className="w-32 bg-gray-800 border-none text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Público</SelectItem>
              <SelectItem value="friends">Amigos</SelectItem>
              <SelectItem value="select">Seleccionar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full justify-between"
          onClick={onSubmit}
          disabled={isUploading}
        >
          <span>Compartir ahora</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
