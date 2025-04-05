
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface PostWrapperProps {
  children: ReactNode;
  isHidden?: boolean;
}

export function PostWrapper({ children, isHidden = false }: PostWrapperProps) {
  if (isHidden) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-10 z-0 pointer-events-none"></div>
        <Card className="overflow-hidden shadow-sm border border-border">
          <div className="relative">
            {/* Línea azul en la parte superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60"></div>
            <div className="p-4 space-y-4 mt-1">
              {children}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm border border-border">
      <div className="relative">
        {/* Línea azul en la parte superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60"></div>
        <div className="p-4 space-y-4 mt-1">
          {children}
        </div>
      </div>
    </Card>
  );
}
