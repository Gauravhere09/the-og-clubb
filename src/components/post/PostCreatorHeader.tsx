
import { useState, useRef, MutableRefObject } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentionUser } from "@/hooks/mentions/types";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";

interface PostCreatorHeaderProps {
  currentUser: { id: string; avatar_url: string | null; username: string | null } | null;
  content: string;
  textareaRef: MutableRefObject<HTMLTextAreaElement>;
  mentionUsers: MentionUser[];
  mentionListVisible: boolean;
  mentionPosition: { top: number; left: number };
  mentionIndex: number;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention: (user: MentionUser) => void;
  handleMentionClick: () => void;
  setMentionIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function PostCreatorHeader({
  currentUser,
  content,
  textareaRef,
  mentionUsers,
  mentionListVisible,
  mentionPosition,
  mentionIndex,
  handleTextAreaChange,
  handleKeyDown,
  handleSelectMention,
  handleMentionClick,
  setMentionIndex
}: PostCreatorHeaderProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={currentUser?.avatar_url || undefined} />
        <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué estás pensando?"
          className="w-full min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm sm:text-base"
        />
        
        {mentionListVisible && (
          <MentionSuggestions
            users={mentionUsers}
            position={mentionPosition}
            selectedIndex={mentionIndex}
            onSelect={handleSelectMention}
            onHover={setMentionIndex}
          />
        )}
      </div>
    </div>
  );
}
