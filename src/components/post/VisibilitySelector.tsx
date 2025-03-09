
import { Globe, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Visibility = 'public' | 'friends' | 'private';

interface VisibilitySelectorProps {
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;
}

export function VisibilitySelector({ visibility, onVisibilityChange }: VisibilitySelectorProps) {
  const getVisibilityIcon = () => {
    switch(visibility) {
      case 'public': return <Globe className="h-4 w-4 mr-2" />;
      case 'friends': return <Users className="h-4 w-4 mr-2" />;
      case 'private': return <span className="mr-2">🔒</span>;
      default: return <Globe className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="flex items-center">
      <Select
        value={visibility}
        onValueChange={(val) => onVisibilityChange(val as Visibility)}
      >
        <SelectTrigger className="w-40">
          <div className="flex items-center">
            {getVisibilityIcon()}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="public">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <span>Público</span>
            </div>
          </SelectItem>
          <SelectItem value="friends">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Seguidores</span>
            </div>
          </SelectItem>
          <SelectItem value="private">
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              <span>Privado</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
