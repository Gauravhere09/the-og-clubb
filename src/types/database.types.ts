
export interface Database {
  public: {
    Tables: {
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
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
        Insert: {
          id?: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string;
          receiver_id?: string;
          created_at?: string;
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
        };
        Insert: {
          id?: string;
          content: string;
          sender_id: string;
          type: 'text' | 'audio';
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string;
          type?: 'text' | 'audio';
          media_url?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: 'friend_request' | 'message' | 'like';
          sender_id: string;
          receiver_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'friend_request' | 'message' | 'like';
          sender_id: string;
          receiver_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'friend_request' | 'message' | 'like';
          sender_id?: string;
          receiver_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables = Database['public']['Tables'];
export type FriendshipRow = Tables['friendships']['Row'];
export type MessageRow = Tables['messages']['Row'];
export type GroupMessageRow = Tables['group_messages']['Row'];
export type ProfileRow = Tables['profiles']['Row'];
export type NotificationRow = Tables['notifications']['Row'];
