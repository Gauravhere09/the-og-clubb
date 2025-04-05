
import { MoreHorizontal, Trash, Eye, Globe, Users, EyeOff, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { Post } from "@/types/post";
import { PostOptionsMenu } from "./actions/PostOptionsMenu";

interface PostHeaderProps {
  post: Post;
  onDelete?: () => void;
  isAuthor?: boolean;
  isHidden?: boolean;
  content: string;
}

export function PostHeader({ post, onDelete, isAuthor, isHidden, content }: PostHeaderProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [open, setOpen] = useState(false);
  const isLongContent = content?.length > 300;
  const displayContent = showFullContent ? content : content?.slice(0, 300);
  
  // Determinar si el post es anónimo basado en el valor de visibility
  const isIncognito = post.visibility === 'incognito';
  
  // Determinar si es una idea
  const isIdea = post.idea !== null && post.idea !== undefined;
  
  // Obtener el icono de visibilidad correcto
  const getVisibilityIcon = () => {
    switch(post.visibility) {
      case 'public': return <Globe className="h-4 w-4 mr-1" />;
      case 'friends': return <Users className="h-4 w-4 mr-1" />;
      case 'incognito': return <EyeOff className="h-4 w-4 mr-1" />;
      default: return <Globe className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 border">
          {/* Si es anónimo, no mostrar una imagen de avatar real */}
          {isIncognito ? (
            <AvatarFallback>A</AvatarFallback>
          ) : (
            <>
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback>{post.profiles?.username?.[0] || 'U'}</AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            {/* Si es anónimo, mostrar "Anónimo", de lo contrario mostrar el nombre de usuario */}
            {isIncognito ? (
              <span className="font-medium">Anónimo</span>
            ) : (
              <Link to={`/profile/${post.user_id}`} className="font-medium hover:underline">
                {post.profiles?.username || 'Usuario'}
              </Link>
            )}
            
            {/* Mostrar el icono de idea si es una idea */}
            {isIdea && (
              <>
                <span className="text-xs text-muted-foreground px-1">•</span>
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-xs">Idea</span>
                </span>
              </>
            )}
            
            <span className="text-xs text-muted-foreground px-1">•</span>
            
            <span className="text-xs text-muted-foreground flex items-center">
              {getVisibilityIcon()}
              {post.visibility === 'public' ? 'Público' : 
                post.visibility === 'friends' ? 'Seguidores' : 'Incógnito'}
            </span>
          </div>
          
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })}
          </span>
        </div>
      </div>
      
      {/* Mostrar el menú de opciones de PostOptionsMenu si no es autor, y el menú de eliminación si es autor */}
      {isAuthor ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="z-[9999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete();
                setOpen(false);
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <PostOptionsMenu 
          postId={post.id} 
          postUserId={post.user_id} 
          isHidden={isHidden}
        />
      )}
    </div>
  );
}
