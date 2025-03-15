
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { reactionIcons, type ReactionType } from "@/components/post/reactions/ReactionIcons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommentReactionsProps {
  commentId: string;
  userReaction: ReactionType | null;
  reactionsCount: number;
  onReaction: (commentId: string, type: ReactionType) => void;
}

export function CommentReactions({ 
  commentId, 
  userReaction, 
  reactionsCount, 
  onReaction 
}: CommentReactionsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const checkAuth = useCallback(async () => {
    // First check the cached state for better UX
    if (isAuthenticated === false) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para reaccionar",
      });
      return false;
    }
    
    // Double check with the server to be sure
    try {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      
      // Update the cached state if it's different
      if (isAuthenticated !== hasSession) {
        setIsAuthenticated(hasSession);
      }
      
      if (!hasSession) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al verificar tu sesión. Intenta de nuevo.",
      });
      return false;
    }
  }, [isAuthenticated, toast]);
  
  const handleReactionClick = useCallback(async (type: ReactionType) => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      onReaction(commentId, type);
    }
    setIsOpen(false);
  }, [checkAuth, commentId, onReaction]);
  
  const handleOpenChange = useCallback(async (open: boolean) => {
    if (open) {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [checkAuth]);
  
  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-0 text-xs ${userReaction ? 'text-primary' : ''}`}
        >
          {userReaction ? 
            <div className={userReaction && reactionIcons[userReaction].color}>
              {reactionIcons[userReaction].icon({ className: "h-3 w-3" })}
            </div> : 
            <div className="text-muted-foreground">
              {reactionIcons.like.icon({ className: "h-3 w-3" })}
            </div>
          }
          <span className="ml-1">{reactionsCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2" align="start">
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, { icon, color }]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${userReaction === type ? color : ''}`}
              onClick={() => handleReactionClick(type as ReactionType)}
            >
              {icon({ className: "h-4 w-4" })}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
