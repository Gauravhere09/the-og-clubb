
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
      className="flex flex-col items-center gap-1 cursor-pointer min-w-[80px] mx-1"
      onClick={handleClick}
    >
      <div className={`relative w-16 h-16 rounded-full ${hasStories ? 'bg-primary p-[2px]' : ''} flex items-center justify-center`}>
        {hasStories ? (
          <Avatar className="w-full h-full border-2 border-background">
            <AvatarImage src={userStory?.avatarUrl || undefined} />
            <AvatarFallback>{userStory?.username?.[0]?.toUpperCase() || 'TU'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-center">
        {hasStories ? 'Tu historia' : 'Crear historia'}
      </span>
    </div>
  );
}
