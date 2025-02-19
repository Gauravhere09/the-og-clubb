
export interface Notification {
  id: string;
  type: 'friend_request' | 'message' | 'like';
  sender_id: string;
  receiver_id: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  type: 'text' | 'audio';
  media_url: string | null;
  created_at: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

// Add interfaces for database tables
export interface Database {
  public: {
    Tables: {
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at: string;
        };
      };
      group_messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          type: 'text' | 'audio';
          media_url: string | null;
          created_at: string;
          profiles: {
            username: string;
            avatar_url: string | null;
          };
        };
      };
      notifications: {
        Row: {
          id: string;
          type: 'friend_request' | 'message' | 'like';
          sender_id: string;
          receiver_id: string;
          created_at: string;
          profiles: {
            id: string;
            username: string;
            avatar_url: string | null;
          };
        };
      };
    };
  };
}
