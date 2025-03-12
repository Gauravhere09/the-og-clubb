
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Story {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  hasUnseenStories: boolean;
}

interface StoriesListProps {
  stories: Story[];
  onStoryClick: (storyId: string) => void;
  currentUserId?: string;
}

export function StoriesList({ stories, onStoryClick, currentUserId }: StoriesListProps) {
  return (
    <>
      {stories.map((story) => (
        <div 
          key={story.id}
          className="flex flex-col items-center space-y-1 cursor-pointer"
          onClick={() => onStoryClick(story.id)}
        >
          <div>
            <Avatar className={`w-16 h-16 ${
              story.hasUnseenStories 
                ? "border-2 border-primary p-[2px]" 
                : "border-2 border-muted p-[2px]"
            } ${story.userId === currentUserId ? "ring-2 ring-primary" : ""}`}>
              <AvatarImage src={story.avatarUrl || undefined} />
              <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-muted-foreground">
            {story.userId === currentUserId ? "Tu historia" : story.username}
          </span>
        </div>
      ))}
    </>
  );
}
