
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/database/social.types";
import { CommentReactionParams } from "./types";

export function useReactionMutations(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const mutationInProgressRef = React.useRef(false);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [hasValidSession, setHasValidSession] = React.useState(false);

  // Check session on component mount
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          setHasValidSession(false);
        } else {
          setHasValidSession(!!data.session);
        }
        setSessionChecked(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setHasValidSession(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasValidSession(!!session);
      setSessionChecked(true);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check if user is authenticated
  const checkAuth = React.useCallback(async (showToast = true) => {
    // If we've already checked and user is authenticated, return true
    if (sessionChecked && hasValidSession) {
      return true;
    }
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session validation error:", error);
        setHasValidSession(false);
        if (showToast) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al verificar la sesión",
          });
        }
        return false;
      }
      
      const isAuthenticated = !!data.session;
      setHasValidSession(isAuthenticated);
      setSessionChecked(true);
      
      if (!isAuthenticated && showToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
      }
      
      return isAuthenticated;
    } catch (err) {
      console.error("Error validating session:", err);
      setHasValidSession(false);
      setSessionChecked(true);
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al verificar la sesión",
        });
      }
      return false;
    }
  }, [sessionChecked, hasValidSession, toast]);

  const { mutate: handleReaction } = useMutation({
    mutationFn: async (type: ReactionType) => {
      // Prevent multiple simultaneous reactions
      if (mutationInProgressRef.current) return;
      mutationInProgressRef.current = true;
      
      try {
        // Check authentication first
        const isAuthenticated = await checkAuth();
        
        if (!isAuthenticated) {
          throw new Error("Debes iniciar sesión para reaccionar");
        }

        const { data } = await supabase.auth.getSession();
        
        if (!data.session?.user) {
          throw new Error("Debes iniciar sesión para reaccionar");
        }

        const { data: existingReactions, error: fetchError } = await supabase
          .from("reactions")
          .select()
          .eq("user_id", data.session.user.id)
          .eq("post_id", postId);

        if (fetchError) throw fetchError;

        // Handling reactions without updating UI prematurely
        if (existingReactions && existingReactions.length > 0) {
          if (existingReactions[0].reaction_type === type) {
            // Remove reaction if clicking the same one
            const { error } = await supabase
              .from("reactions")
              .delete()
              .eq("id", existingReactions[0].id);
            if (error) throw error;
          } else {
            // Replace with new reaction
            const { error } = await supabase
              .from("reactions")
              .update({ reaction_type: type })
              .eq("id", existingReactions[0].id);
            if (error) throw error;
          }
        } else {
          // Create new reaction
          const { error } = await supabase
            .from("reactions")
            .insert({
              user_id: data.session.user.id,
              post_id: postId,
              reaction_type: type
            });
          if (error) throw error;
        }
        
        // Only invalidate queries after DB operation is complete
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        return type;
      } catch (error) {
        console.error("Error handling reaction:", error);
        throw error;
      } finally {
        mutationInProgressRef.current = false;
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
    },
  });

  const { mutate: toggleCommentReaction } = useMutation({
    mutationFn: async ({ commentId, type }: CommentReactionParams) => {
      console.log(`Toggling reaction ${type} for comment ${commentId}`);
      
      // Check authentication first without showing a toast (we'll show it later if needed)
      const isAuthenticated = await checkAuth(false);
      
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data } = await supabase.auth.getSession();
      
      if (!data.session?.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para reaccionar",
        });
        throw new Error("Debes iniciar sesión para reaccionar");
      }
      
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select()
        .eq('user_id', data.session.user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingReaction) {
        if (existingReaction.reaction_type === type) {
          console.log(`Removing existing ${type} reaction`);
          const { error } = await supabase
            .from('reactions')
            .delete()
            .eq('id', existingReaction.id);
          if (error) throw error;
        } else {
          console.log(`Updating reaction from ${existingReaction.reaction_type} to ${type}`);
          const { error } = await supabase
            .from('reactions')
            .update({ reaction_type: type })
            .eq('id', existingReaction.id);
          if (error) throw error;
        }
      } else {
        console.log(`Creating new ${type} reaction`);
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: data.session.user.id,
            comment_id: commentId,
            reaction_type: type
          });
        if (error) throw error;
      }

      // Invalidate after successful operation
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      toast({
        title: "Reacción actualizada",
        description: "Tu reacción ha sido registrada",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la reacción",
      });
    },
  });

  return {
    handleReaction,
    toggleCommentReaction,
    isAuthenticated: hasValidSession,
    checkAuth
  };
}
