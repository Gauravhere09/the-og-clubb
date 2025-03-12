
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
}

export function StoriesList({ stories, onStoryClick }: StoriesListProps) {
  return (
    <>
      {stories.map((story) => (
        <div 
          key={story.id}
          className="flex flex-col items-center space-y-1"
          onClick={() => onStoryClick(story.id)}
        >
          <div className="cursor-pointer">
            <Avatar className={`w-16 h-16 ${
              story.hasUnseenStories 
                ? "border-2 border-primary p-[2px]" 
                : "border-2 border-muted p-[2px]"
            }`}>
              <AvatarImage src={story.avatarUrl || undefined} />
              <AvatarFallback>{story.username[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-muted-foreground">
            {story.username}
          </span>
        </div>
      ))}
    </>
  );
}
