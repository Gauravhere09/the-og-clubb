
interface StoryContentProps {
  imageUrl: string;
  onContentClick: () => void;
}

export function StoryContent({ imageUrl, onContentClick }: StoryContentProps) {
  return (
    <div 
      className="flex-1 bg-black flex items-center justify-center relative"
      onClick={onContentClick}
    >
      <img 
        src={imageUrl} 
        alt="Story" 
        className="max-h-full max-w-full object-contain" 
      />
    </div>
  );
}
