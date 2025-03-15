
import React, { useRef, useCallback } from "react";
import { reactionIcons, type ReactionType } from "./ReactionIcons";
import { cn } from "@/lib/utils";

interface ReactionMenuProps {
  show: boolean;
  activeReaction: ReactionType | null;
  setActiveReaction: (reaction: ReactionType | null) => void;
  onReactionSelected: (type: ReactionType) => void;
  onPointerLeave: () => void;
}

export function ReactionMenu({
  show,
  activeReaction,
  setActiveReaction,
  onReactionSelected,
  onPointerLeave
}: ReactionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle pointer movement over reactions
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!menuRef.current) return;
    
    const reactionMenu = menuRef.current;
    const rect = reactionMenu.getBoundingClientRect();
    
    // Check if pointer is inside the menu
    if (
      e.clientX >= rect.left && 
      e.clientX <= rect.right && 
      e.clientY >= rect.top && 
      e.clientY <= rect.bottom
    ) {
      // Calculate which reaction is active based on horizontal position
      const reactionButtons = reactionMenu.querySelectorAll('button');
      const reactionsArray = Array.from(reactionButtons);
      
      for (let i = 0; i < reactionsArray.length; i++) {
        const buttonRect = reactionsArray[i].getBoundingClientRect();
        if (e.clientX >= buttonRect.left && e.clientX <= buttonRect.right) {
          // Reaction type is stored as data-reaction-type attribute
          const type = reactionsArray[i].getAttribute('data-reaction-type') as ReactionType;
          setActiveReaction(type);
          break;
        }
      }
    } else {
      // If pointer is outside menu, no reaction is active
      setActiveReaction(null);
    }
  }, [setActiveReaction]);

  // Handle click on a reaction
  const handleReactionClick = useCallback((type: ReactionType) => {
    onReactionSelected(type);
    // Auto-close menu after selection
    setTimeout(() => onPointerLeave(), 200);
  }, [onReactionSelected, onPointerLeave]);

  if (!show) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute -top-16 left-0 flex p-2 bg-background border rounded-full shadow-lg z-50 transition-all duration-200 transform origin-bottom-left animate-fade-in"
      onPointerMove={handlePointerMove}
      onPointerLeave={onPointerLeave}
    >
      {Object.entries(reactionIcons).map(([type, { icon: Icon, color, label }]) => (
        <button
          key={type}
          id={`reaction-${type}`}
          name={`reaction-${type}`}
          data-reaction-type={type}
          className={cn(
            "p-2 mx-1 rounded-full transition-all duration-200",
            activeReaction === type ? "scale-125 bg-muted" : "hover:scale-110",
            activeReaction === type ? color : ""
          )}
          onClick={() => handleReactionClick(type as ReactionType)}
        >
          <span className={cn("block h-6 w-6", activeReaction === type ? color : "")}>
            <Icon className="h-6 w-6" />
          </span>
          {activeReaction === type && (
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-background text-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
              {label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
