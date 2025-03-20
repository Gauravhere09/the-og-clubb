
import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentionUser, MentionPosition } from "@/hooks/mentions/types";

interface MentionSuggestionsProps {
  users: MentionUser[];
  isVisible: boolean;
  position: MentionPosition;
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
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Scroll selected item into view
  useEffect(() => {
    if (isVisible && menuRef.current && selectedIndex >= 0) {
      const selectedElement = menuRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, isVisible]);
  
  if (!isVisible || users.length === 0) {
    return null;
  }
  
  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-background border rounded-lg shadow-md max-h-[200px] w-[250px] overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {users.map((user, index) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)}
          onMouseEnter={() => onSetIndex(index)}
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted transition-colors ${
            index === selectedIndex ? 'bg-muted' : ''
          }`}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatar_url || ""} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">@{user.username}</span>
        </div>
      ))}
      {users.length === 0 && (
        <div className="p-2 text-sm text-muted-foreground">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
