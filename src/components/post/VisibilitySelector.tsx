
import { Globe, Users, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Visibility = 'public' | 'friends' | 'incognito';

interface VisibilitySelectorProps {
  visibility: Visibility;
  onVisibilityChange: (visibility: Visibility) => void;
}

export function VisibilitySelector({ visibility, onVisibilityChange }: VisibilitySelectorProps) {
  const getVisibilityIcon = () => {
    switch(visibility) {
      case 'public': return <Globe className="h-4 w-4 mr-2" />;
      case 'friends': return <Users className="h-4 w-4 mr-2" />;
      case 'incognito': return <EyeOff className="h-4 w-4 mr-2" />;
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
          <SelectItem value="incognito">
            <div className="flex items-center">
              <EyeOff className="h-4 w-4 mr-2" />
              <span>Incógnito</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
