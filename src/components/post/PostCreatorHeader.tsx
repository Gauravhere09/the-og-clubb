
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentionSuggestions } from "@/components/mentions/MentionSuggestions";
import { Lightbulb } from "lucide-react";

interface PostCreatorHeaderProps {
  currentUser: { id: string; avatar_url: string | null; username: string | null } | null;
  content: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  mentionUsers: any[];
  mentionListVisible: boolean;
  mentionPosition: { top: number; left: number };
  mentionIndex: number;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSelectMention: (user: any) => void;
  handleMentionClick: () => void;
  setMentionIndex: React.Dispatch<React.SetStateAction<number>>;
  placeholder?: string;
  isIdeaMode?: boolean;
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
  setMentionIndex,
  placeholder = "¿Qué estás pensando?",
  isIdeaMode = false
}: PostCreatorHeaderProps) {
  return (
    <div className="flex space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={currentUser?.avatar_url || undefined} />
        <AvatarFallback>
          {currentUser?.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 relative">
        {isIdeaMode && (
          <div className="absolute top-2 right-2 flex items-center text-primary">
            <Lightbulb className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Idea</span>
          </div>
        )}
        
        <div className={`border rounded-lg ${isIdeaMode ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-background border-input'}`}>
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={content}
            onChange={handleTextAreaChange}
            onKeyDown={handleKeyDown}
            className={`w-full min-h-[80px] p-3 rounded-lg resize-none bg-transparent focus:outline-none ${isIdeaMode ? 'text-foreground' : ''}`}
          />
        </div>
        
        {mentionListVisible && mentionUsers.length > 0 && (
          <MentionSuggestions
            users={mentionUsers}
            position={mentionPosition}
            selectedIndex={mentionIndex}
            onSelectUser={handleSelectMention}
            onSetIndex={setMentionIndex}
          />
        )}
      </div>
    </div>
  );
}
