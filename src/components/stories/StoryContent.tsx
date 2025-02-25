
import { Story } from "./types";

interface StoryContentProps {
  story: Story;
}

export function StoryContent({ story }: StoryContentProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      {story.media_type === 'image' && (
        <img
          src={story.media_url || ''}
          alt="Story"
          className="max-h-full object-contain"
        />
      )}
      {story.media_type === 'audio' && (
        <audio
          src={story.media_url || ''}
          controls
          className="w-96 max-w-full"
        />
      )}
      {story.content && (
        <p className="text-white text-xl font-medium p-4 text-center">
          {story.content}
        </p>
      )}
    </div>
  );
}
