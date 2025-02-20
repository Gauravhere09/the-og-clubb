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
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          reaction_type: 'like' | 'love' | 'haha' | 'sad' | 'angry';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          reaction_type: 'like' | 'love' | 'haha' | 'sad' | 'angry';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          reaction_type?: 'like' | 'love' | 'haha' | 'sad' | 'angry';
          created_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: string | null;
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
      messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          sender_id: string;
          receiver_id: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string;
          receiver_id?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
      group_messages: {
        Row: {
          id: string;
          content: string;
          sender_id: string;
          type: string | null;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          sender_id: string;
          type?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          sender_id?: string;
          type?: string | null;
          media_url?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: string;
          sender_id: string;
          receiver_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          sender_id: string;
          receiver_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
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
