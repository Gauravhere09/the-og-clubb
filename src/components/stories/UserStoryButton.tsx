
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface UserStoryButtonProps {
  currentUserId: string;
  userStory: any;
  onCreateStory: () => void;
  onViewStory: (storyId: string) => void;
}

export function UserStoryButton({ 
  currentUserId, 
  userStory, 
  onCreateStory, 
  onViewStory 
}: UserStoryButtonProps) {
  // Check if the user has stories and get the first story ID
  const hasStories = userStory && userStory.storyIds && userStory.storyIds.length > 0;
  const firstStoryId = hasStories ? userStory.storyIds[0] : null;
  
  const handleClick = () => {
    if (hasStories && firstStoryId) {
      onViewStory(firstStoryId);
    } else {
      onCreateStory();
    }
  };

  return (
    <div 
      className="flex flex-col items-center gap-1 cursor-pointer min-w-[80px]"
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded-full relative bg-primary/10 flex items-center justify-center">
        <div className={`w-[58px] h-[58px] rounded-full flex items-center justify-center ${hasStories ? 'border-2 border-primary' : 'bg-background'}`}>
          {hasStories ? (
            <Avatar className="w-full h-full">
              <AvatarImage src={userStory?.avatarUrl || undefined} />
              <AvatarFallback>{userStory?.username?.[0]?.toUpperCase() || 'TU'}</AvatarFallback>
            </Avatar>
          ) : (
            <Plus className="w-6 h-6 text-primary" />
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-center">
        {hasStories ? 'Tu historia' : 'Crear historia'}
      </span>
    </div>
  );
}
