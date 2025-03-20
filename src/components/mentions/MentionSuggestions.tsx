
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
  
  // Agrupar usuarios por tipo (primero amigos, luego seguidores, luego otros)
  const groupedUsers = {
    friends: users.filter(user => user.relationship === 'Amigo'),
    followers: users.filter(user => user.relationship === 'Seguidor'),
    others: users.filter(user => !user.relationship)
  };

  // Función para renderizar grupos de usuarios con encabezados
  const renderUserGroup = (groupLabel: string, groupUsers: MentionUser[], startIndex: number) => {
    if (groupUsers.length === 0) return null;
    
    return (
      <div key={groupLabel}>
        {groupLabel !== 'none' && (
          <div className="px-2 py-1 text-xs text-muted-foreground bg-muted/50">
            {groupLabel === 'Amigos' ? 'Amigos' : 
             groupLabel === 'Seguidores' ? 'Seguidores' : ''}
          </div>
        )}
        {groupUsers.map((user, idx) => {
          const actualIndex = startIndex + idx;
          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              onMouseEnter={() => onSetIndex(actualIndex)}
              className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted transition-colors ${
                actualIndex === selectedIndex ? 'bg-muted' : ''
              }`}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">@{user.username}</span>
                {user.relationship && (
                  <span className="text-xs text-muted-foreground">{user.relationship}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-background border rounded-lg shadow-md max-h-[300px] w-[250px] overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {users.length > 0 ? (
        <>
          {renderUserGroup('Amigos', groupedUsers.friends, 0)}
          {renderUserGroup('Seguidores', groupedUsers.followers, groupedUsers.friends.length)}
          {renderUserGroup('none', groupedUsers.others, groupedUsers.friends.length + groupedUsers.followers.length)}
        </>
      ) : (
        <div className="p-2 text-sm text-muted-foreground">
          No se encontraron usuarios
        </div>
      )}
    </div>
  );
}
