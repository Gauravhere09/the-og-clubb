
import { Textarea } from "@/components/ui/textarea";
import { MentionSuggestions } from "../mentions/MentionSuggestions";
import { MentionPosition } from "@/hooks/mentions/types";
import { MentionUser } from "@/hooks/mentions/types";
import { RefObject } from "react";

interface PostContentInputProps {
  content: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  mentionUsers: MentionUser[];
  mentionListVisible: boolean;
  mentionPosition: MentionPosition;
  mentionIndex: number;
  onSelectUser: (user: MentionUser) => void;
  onSetIndex: (index: number) => void;
}

export function PostContentInput({
  content,
  textareaRef,
  handleTextAreaChange,
  handleKeyDown,
  mentionUsers,
  mentionListVisible,
  mentionPosition,
  mentionIndex,
  onSelectUser,
  onSetIndex
}: PostContentInputProps) {
  return (
    <div className="relative flex-1">
      <Textarea
        ref={textareaRef}
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={handleTextAreaChange}
        onKeyDown={handleKeyDown}
        className="resize-none rounded-full pl-4 pr-12 py-2 min-h-0 h-10 focus-visible:h-20 transition-all duration-200 bg-muted/50"
      />
      
      <MentionSuggestions
        users={mentionUsers}
        isVisible={mentionListVisible}
        position={mentionPosition}
        selectedIndex={mentionIndex}
        onSelectUser={onSelectUser}
        onSetIndex={onSetIndex}
      />
    </div>
  );
}
