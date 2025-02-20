
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post } from "@/types/post";

interface PostHeaderProps {
  post: Post;
  onDelete: () => void;
}

export function PostHeader({ post, onDelete }: PostHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-1 flex items-start gap-3">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url} />
          <AvatarFallback>{post.profiles?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium">{post.profiles?.username}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(post.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-accent"
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-red-600 hover:text-red-600 hover:bg-red-50"
          >
            Eliminar publicación
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
