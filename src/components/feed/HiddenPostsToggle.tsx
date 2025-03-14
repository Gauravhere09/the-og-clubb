
import React from "react";

interface HiddenPostsToggleProps {
  showHidden: boolean;
  onToggle: () => void;
  hiddenPostsCount: number;
}

export function HiddenPostsToggle({ 
  showHidden, 
  onToggle, 
  hiddenPostsCount 
}: HiddenPostsToggleProps) {
  if (hiddenPostsCount === 0) return null;
  
  return (
    <div className="flex justify-center mb-2">
      <button 
        onClick={onToggle}
        className="text-sm text-primary hover:underline"
      >
        {showHidden 
          ? "Ocultar publicaciones filtradas" 
          : `Mostrar ${hiddenPostsCount} publicaciones ocultas`}
      </button>
    </div>
  );
}
