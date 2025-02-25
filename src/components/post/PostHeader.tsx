
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Flag, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
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
  isAuthor: boolean;
}

export function PostHeader({ post, onDelete, isAuthor }: PostHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-1 flex items-start gap-3">
        <Link to={`/profile/${post.user_id}`}>
          <Avatar>
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>{post.profiles?.username?.[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${post.user_id}`}
            className="hover:underline"
          >
            <h3 className="font-medium">{post.profiles?.username}</h3>
          </Link>
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
          {isAuthor ? (
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Eliminar publicación
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar publicación
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Flag className="h-4 w-4 mr-2" />
                Reportar publicación
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
