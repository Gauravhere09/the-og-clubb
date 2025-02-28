
import { Link2, Share } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import type { Post } from "@/types/post";

interface ShareOptionsProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareOptions({ post, open, onOpenChange }: ShareOptionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    });
    onOpenChange(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compartir publicación",
          text: post.content,
          url: `${window.location.origin}/post/${post.id}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleShareToProfile = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para compartir",
        });
        return;
      }

      // Create a new post that references the original content without using shared_from column
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: `Compartido: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`,
          user_id: userId,
          media_url: post.media_url,
          media_type: post.media_type,
          visibility: 'public'
        });

      if (error) {
        console.error("Error sharing post:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo compartir la publicación",
        });
      } else {
        // Invalidate the posts query to refresh the feed
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        
        toast({
          title: "¡Publicación compartida!",
          description: "La publicación ha sido compartida en tu perfil",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error in share function:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al compartir la publicación",
      });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex-1">
          <Share className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleShareToProfile}>
          <Share className="h-4 w-4 mr-2" />
          Compartir en mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copiar enlace
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Compartir con...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
