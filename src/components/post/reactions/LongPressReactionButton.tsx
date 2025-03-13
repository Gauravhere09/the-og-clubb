
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

interface LongPressReactionButtonProps {
  userReaction?: ReactionType;
  onReactionClick: (type: ReactionType) => void;
  postId: string;
}

export function LongPressReactionButton({ 
  userReaction, 
  onReactionClick, 
  postId 
}: LongPressReactionButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressThreshold = 500; // ms
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);

  // Memoize the reaction handler to prevent unnecessary re-renders
  const handleReactionClick = useCallback(async (type: ReactionType) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para reaccionar");

      // We'll handle the UI update AFTER the database operation is complete
      if (userReaction === type) {
        // If the user clicks on their current reaction, remove it
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      } else {
        // First delete any existing reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Then insert the new reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });

        if (error) throw error;
        
        // Only update UI after successful database operation
        onReactionClick(type);
      }
      
      // Invalidate the posts and reactions queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      await queryClient.invalidateQueries({ queryKey: ["post-reactions", postId] });
      
    } catch (error) {
      console.error('Error al gestionar la reacción:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar tu reacción",
      });
    } finally {
      setIsSubmitting(false);
      setShowReactions(false);
      setActiveReaction(null);
    }
  }, [isSubmitting, onReactionClick, postId, queryClient, toast, userReaction]);

  const handlePressStart = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, longPressThreshold);
  }, [longPressThreshold]);

  const handlePressEnd = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    // Si hay una reacción activa, aplicarla cuando se levante el dedo/ratón
    if (activeReaction && showReactions) {
      handleReactionClick(activeReaction);
    }
    
    // No ocultamos el menú inmediatamente para permitir clicks normales
    // Esto se hará al hacer clic en una reacción o al salir del área
  }, [activeReaction, handleReactionClick, showReactions]);

  // Manejar el movimiento sobre las reacciones
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!showReactions || !reactionMenuRef.current) return;
    
    const reactionMenu = reactionMenuRef.current;
    const rect = reactionMenu.getBoundingClientRect();
    
    // Comprobar si el puntero está dentro del menú
    if (
      e.clientX >= rect.left && 
      e.clientX <= rect.right && 
      e.clientY >= rect.top && 
      e.clientY <= rect.bottom
    ) {
      // Calcular qué reacción está activa en base a la posición horizontal
      const reactionButtons = reactionMenu.querySelectorAll('button');
      const reactionsArray = Array.from(reactionButtons);
      
      for (let i = 0; i < reactionsArray.length; i++) {
        const buttonRect = reactionsArray[i].getBoundingClientRect();
        if (e.clientX >= buttonRect.left && e.clientX <= buttonRect.right) {
          // El tipo de reacción está almacenado como atributo data-reaction-type
          const type = reactionsArray[i].getAttribute('data-reaction-type') as ReactionType;
          setActiveReaction(type);
          break;
        }
      }
    } else {
      // Si el puntero está fuera del menú, no hay reacción activa
      setActiveReaction(null);
    }
  }, [showReactions]);

  // Manejar salida del área del menú
  const handlePointerLeave = useCallback(() => {
    // Pequeño retraso para permitir seleccionar reacciones
    setTimeout(() => {
      if (activeReaction) {
        handleReactionClick(activeReaction);
      } else {
        setShowReactions(false);
      }
    }, 100);
  }, [activeReaction, handleReactionClick]);

  // Handle click on the main button (non-long press)
  const handleButtonClick = useCallback(() => {
    if (!showReactions && userReaction) {
      handleReactionClick(userReaction);
    }
  }, [handleReactionClick, showReactions, userReaction]);

  // Touch event handlers that are properly typed
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handlePressStart();
  }, [handlePressStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    handlePressEnd();
  }, [handlePressEnd]);

  // Configurar y limpiar event listeners para el movimiento del puntero
  useEffect(() => {
    if (showReactions) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePressEnd);
    } else {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePressEnd);
    }
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePressEnd);
    };
  }, [showReactions, handlePointerMove, handlePressEnd]);

  // Clean up timer if component unmounts while timer is active
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={`${userReaction ? reactionIcons[userReaction].color : ''} group`}
        onClick={handleButtonClick}
        disabled={isSubmitting}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {userReaction ? (
          <div className="flex items-center">
            {React.createElement(reactionIcons[userReaction].icon, { className: "h-4 w-4" })}
            <span className="ml-2">{reactionIcons[userReaction].label}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Me gusta
          </div>
        )}
      </Button>

      {/* Menú flotante de reacciones */}
      {showReactions && (
        <div 
          ref={reactionMenuRef}
          className="absolute -top-16 left-0 flex p-2 bg-background border rounded-full shadow-lg z-50 transition-all duration-200 transform origin-bottom-left"
          onPointerLeave={handlePointerLeave}
        >
          {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
            <button
              key={type}
              data-reaction-type={type}
              className={cn(
                "p-2 mx-1 rounded-full transition-all duration-200",
                activeReaction === type ? "scale-125 bg-muted" : "hover:scale-110",
                activeReaction === type ? color : ""
              )}
            >
              <Icon className={cn("h-6 w-6", activeReaction === type ? color : "")} />
              {activeReaction === type && (
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-background text-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                  {label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

