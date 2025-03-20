
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  EyeOff, 
  UserX, 
  ThumbsUp, 
  ThumbsDown, 
  Flag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hidePost, unhidePost } from "@/lib/api/posts/manage";

interface PostOptionsMenuProps {
  postId: string;
  postUserId: string;
  isHidden?: boolean;
  onHideToggle?: () => void;
}

export function PostOptionsMenu({ 
  postId, 
  postUserId, 
  isHidden = false,
  onHideToggle
}: PostOptionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSetInterest = async (level: 'interested' | 'not_interested') => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
        });
        return;
      }
      
      // Check if interest already exists
      const { data: existingInterest } = await supabase
        .from('post_interests')
        .select('id, interest_level')
        .eq('post_id', postId)
        .eq('user_id', userData.user.id)
        .single();
      
      if (existingInterest) {
        // Update existing interest
        await supabase
          .from('post_interests')
          .update({ interest_level: level })
          .eq('id', existingInterest.id);
      } else {
        // Create new interest
        await supabase
          .from('post_interests')
          .insert({
            post_id: postId,
            user_id: userData.user.id,
            interest_level: level
          });
      }
      
      toast({
        title: level === 'interested' ? "Te interesa" : "No te interesa",
        description: level === 'interested' 
          ? "Verás más contenido como este" 
          : "Verás menos contenido como este",
      });
    } catch (error) {
      console.error('Error setting interest:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar tu interés",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHidePost = async () => {
    try {
      setIsLoading(true);
      
      if (isHidden) {
        await unhidePost(postId);
        toast({
          title: "Publicación mostrada",
          description: "Esta publicación ahora está visible",
        });
      } else {
        await hidePost(postId);
        toast({
          title: "Publicación oculta",
          description: "Ya no verás esta publicación",
        });
      }
      
      if (onHideToggle) {
        onHideToggle();
      }
    } catch (error) {
      console.error('Error hiding post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ocultar la publicación",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideUser = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
        });
        return;
      }
      
      // Add to hidden users
      await supabase
        .from('hidden_users')
        .insert({
          user_id: userData.user.id,
          hidden_user_id: postUserId
        });
      
      toast({
        title: "Usuario oculto",
        description: "Ya no verás publicaciones de este usuario",
      });
    } catch (error) {
      console.error('Error hiding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ocultar al usuario",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportPost = () => {
    navigate(`/report?type=post&id=${postId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full absolute top-2 right-2"
          aria-label="Opciones de publicación"
          disabled={isLoading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSetInterest('interested')}>
          <ThumbsUp className="mr-2 h-4 w-4" />
          Me interesa
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSetInterest('not_interested')}>
          <ThumbsDown className="mr-2 h-4 w-4" />
          No me interesa
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleHidePost}>
          <EyeOff className="mr-2 h-4 w-4" />
          {isHidden ? "Mostrar publicación" : "Ocultar publicación"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleHideUser}>
          <UserX className="mr-2 h-4 w-4" />
          Ocultar de {postUserId}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleReportPost} className="text-red-500">
          <Flag className="mr-2 h-4 w-4" />
          Reportar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
