
export interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  content: string;
  media_url: string | null;
  media_type: 'image' | 'audio' | null;
  created_at: string;
}

export interface StoryViewProps {
  stories: Story[];
  initialStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
}
