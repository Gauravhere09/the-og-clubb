
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { MentionUser } from "@/hooks/mentions/types";

interface MentionSuggestionsProps {
  users: MentionUser[];
  isVisible: boolean;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelectUser: (user: MentionUser) => void;
  onSetIndex: (index: number) => void;
}

export function MentionSuggestions({
  users,
  isVisible,
  position,
  selectedIndex,
  onSelectUser,
  onSetIndex
}: MentionSuggestionsProps) {
  // Log visibility state and users to help debug
  useEffect(() => {
    console.log("MentionSuggestions render:", { 
      isVisible, 
      users: users.length,
      position
    });
  }, [isVisible, users, position]);

  if (!isVisible) {
    return null;
  }
  
  if (users.length === 0) {
    // Show "No results" indicator instead of returning null
    return (
      <div
        className="fixed z-50 bg-background border rounded-md shadow-md w-64 p-2 text-center"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <span className="text-sm text-muted-foreground">No se encontraron usuarios</span>
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 bg-background border rounded-md shadow-md w-64 max-h-60 overflow-y-auto mention-list"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="py-1">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent",
              selectedIndex === index ? "bg-accent mention-highlight" : ""
            )}
            onClick={() => onSelectUser(user)}
            onMouseEnter={() => onSetIndex(index)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={user.avatar_url || undefined} 
                alt={user.username}
                onError={(e) => {
                  console.log("Error cargando avatar en menciones:", e);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none'; // Ocultar imagen en error
                }}
              />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
