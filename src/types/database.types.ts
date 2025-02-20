export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          reaction_type?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          media_url: string | null;
          media_type: 'image' | 'video' | null;
          visibility: 'public' | 'friends' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          user_id: string;
          media_url?: string | null;
          media_type?: 'image' | 'video' | null;
          visibility?: 'public' | 'friends' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string;
          media_url?: string | null;
          media_type?: 'image' | 'video' | null;
          visibility?: 'public' | 'friends' | 'private';
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          post_id: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          user_id: string;
          post_id: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string;
          post_id?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables = Database['public']['Tables'];
