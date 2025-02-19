
export interface Database {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          parent_id: string;
          post_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          parent_id?: string;
          post_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          parent_id?: string;
          post_id?: string;
          updated_at?: string;
          user_id?: string;
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
      likes: {
        Row: {
          comment_id: string;
          created_at: string;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          comment_id?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
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
      posts: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
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
export type TableName = keyof Tables;

// Row Level Types
export type CommentRow = Tables['comments']['Row'];
export type FriendshipRow = Tables['friendships']['Row'];
export type GroupMessageRow = Tables['group_messages']['Row'];
export type LikeRow = Tables['likes']['Row'];
export type MessageRow = Tables['messages']['Row'];
export type NotificationRow = Tables['notifications']['Row'];
export type PostRow = Tables['posts']['Row'];
export type ProfileRow = Tables['profiles']['Row'];

// Insert Types
export type CommentInsert = Tables['comments']['Insert'];
export type FriendshipInsert = Tables['friendships']['Insert'];
export type GroupMessageInsert = Tables['group_messages']['Insert'];
export type LikeInsert = Tables['likes']['Insert'];
export type MessageInsert = Tables['messages']['Insert'];
export type NotificationInsert = Tables['notifications']['Insert'];
export type PostInsert = Tables['posts']['Insert'];
export type ProfileInsert = Tables['profiles']['Insert'];

// Update Types
export type CommentUpdate = Tables['comments']['Update'];
export type FriendshipUpdate = Tables['friendships']['Update'];
export type GroupMessageUpdate = Tables['group_messages']['Update'];
export type LikeUpdate = Tables['likes']['Update'];
export type MessageUpdate = Tables['messages']['Update'];
export type NotificationUpdate = Tables['notifications']['Update'];
export type PostUpdate = Tables['posts']['Update'];
export type ProfileUpdate = Tables['profiles']['Update'];
