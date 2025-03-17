
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatarDisplay } from "./UserAvatarDisplay";
import { PostContentInput } from "./PostContentInput";
import { RefObject } from "react";
import { MentionPosition, MentionUser } from "@/hooks/mentions/types";

interface PostHeaderProps {
  currentUser: { 
    id: string;
    avatar_url: string | null;
    username: string | null;
  } | null;
  content: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  mentionUsers: MentionUser[];
  mentionListVisible: boolean;
  mentionPosition: MentionPosition;
  mentionIndex: number;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention: (user: MentionUser) => void;
  handleMentionClick: () => void;
  setMentionIndex: (index: number) => void;
}

export function PostHeader({
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
}: PostHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <UserAvatarDisplay currentUser={currentUser} />
        
        <PostContentInput
          content={content}
          textareaRef={textareaRef}
          handleTextAreaChange={handleTextAreaChange}
          handleKeyDown={handleKeyDown}
          mentionUsers={mentionUsers}
          mentionListVisible={mentionListVisible}
          mentionPosition={mentionPosition}
          mentionIndex={mentionIndex}
          onSelectUser={handleSelectMention}
          onSetIndex={setMentionIndex}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleMentionClick}
          className="text-sm flex items-center gap-1"
        >
          <span className="sr-only">Mencionar</span>
          <AtSign className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
