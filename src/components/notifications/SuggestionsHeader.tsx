
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SuggestionsHeaderProps {
  onToggleVisibility?: () => void;
  showToggle?: boolean;
}

export function SuggestionsHeader({ onToggleVisibility, showToggle = false }: SuggestionsHeaderProps) {
  return (
    <div className="p-2 bg-muted/50 text-sm font-medium text-muted-foreground flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span>Sugerencias para ti</span>
      </div>
      {showToggle && onToggleVisibility && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={onToggleVisibility}
        >
          <ChevronDown className="h-3 w-3 mr-1" />
          <span>Ocultar</span>
        </Button>
      )}
    </div>
  );
}
