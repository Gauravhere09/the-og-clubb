
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Flag, EyeOff, Eye } from "lucide-react";
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
import { ReportDialog } from "./actions/ReportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { hidePost, unhidePost } from "@/lib/api/posts/manage";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PostHeaderProps {
  post: Post;
  onDelete: () => void;
  isAuthor: boolean;
  isHidden?: boolean;
}

export function PostHeader({ post, onDelete, isAuthor, isHidden = false }: PostHeaderProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Obtener el ID del usuario actual
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getUserId();
  }, []);

  const handleHidePost = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await hidePost(post.id);
      toast({
        title: "Publicación oculta",
        description: "Esta publicación ha sido ocultada de tu feed",
      });
      // Invalidar la consulta para actualizar el feed
      queryClient.invalidateQueries({ queryKey: ["hidden-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Error al ocultar la publicación:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ocultar la publicación",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnhidePost = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await unhidePost(post.id);
      toast({
        title: "Publicación visible",
        description: "Esta publicación ahora es visible en tu feed",
      });
      // Invalidar la consulta para actualizar el feed
      queryClient.invalidateQueries({ queryKey: ["hidden-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Error al mostrar la publicación:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo mostrar la publicación",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {isHidden ? (
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={handleUnhidePost}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isLoading ? "Procesando..." : "Mostrar publicación"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={handleHidePost}
              disabled={isLoading}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              {isLoading ? "Procesando..." : "Ocultar publicación"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setShowReportDialog(true)}
          >
            <Flag className="h-4 w-4 mr-2" />
            Reportar publicación
          </DropdownMenuItem>
          {isAuthor && (
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Eliminar publicación
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog 
        postId={post.id}
        userId={currentUserId}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </div>
  );
}
