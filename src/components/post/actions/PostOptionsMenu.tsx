import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsername() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', postUserId)
          .single();
        
        if (error) throw error;
        setUsername(data?.username || "Usuario");
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("Usuario");
      }
    }
    
    fetchUsername();
  }, [postUserId]);

  const handleSetInterest = async (level: 'interested' | 'not_interested') => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
        });
        return;
      }
      
      const { data: existingInterest } = await supabase
        .from('post_interests')
        .select('id, interest_level')
        .eq('post_id', postId)
        .eq('user_id', userData.user.id)
        .single();
      
      if (existingInterest) {
        await supabase
          .from('post_interests')
          .update({ interest_level: level })
          .eq('id', existingInterest.id);
      } else {
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
      setOpen(false);
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
      setOpen(false);
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
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para realizar esta acción",
        });
        return;
      }
      
      await supabase
        .from('hidden_users')
        .insert({
          user_id: userData.user.id,
          hidden_user_id: postUserId
        });
      
      toast({
        title: "Usuario oculto",
        description: `Ya no verás publicaciones de ${username || 'este usuario'}`,
      });
      setOpen(false);
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
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Opciones de publicación"
          disabled={isLoading}
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
        className="w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleSetInterest('interested')} 
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Me interesa
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleSetInterest('not_interested')} 
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          No me interesa
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleHidePost} 
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <EyeOff className="mr-2 h-4 w-4" />
          {isHidden ? "Mostrar publicación" : "Ocultar publicación"}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleHideUser} 
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <UserX className="mr-2 h-4 w-4" />
          Ocultar de {username || 'este usuario'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleReportPost} 
          className="text-red-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Flag className="mr-2 h-4 w-4" />
          Reportar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
