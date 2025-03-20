
import { MoreHorizontal, Link, Trash2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StoryMenuProps {
  canDelete: boolean;
  onDeleteRequest: () => void;
}

export function StoryMenu({ canDelete, onDeleteRequest }: StoryMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="bg-black/50 text-white hover:bg-black/70"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 text-white border-gray-800 dark:bg-gray-900 w-72 p-0">
        <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
          <Link className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium">Copiar enlace para compartir esta historia</span>
            <span className="text-xs text-gray-400">La audiencia podrá ver tu historia durante 24 horas.</span>
          </div>
        </DropdownMenuItem>
        
        {canDelete && (
          <DropdownMenuItem 
            className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-red-400"
            onClick={onDeleteRequest}
          >
            <Trash2 className="h-5 w-5" />
            <span className="font-medium">Eliminar historia</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem className="py-3 px-4 hover:bg-gray-800 cursor-pointer flex items-center gap-3 text-white dark:text-white">
          <Bug className="h-5 w-5" />
          <span className="font-medium">Algo no funciona</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
