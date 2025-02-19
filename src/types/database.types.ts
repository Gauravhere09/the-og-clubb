
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          receiver_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          receiver_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          receiver_id?: string
          created_at?: string
        }
      }
      group_messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          type: 'text' | 'audio'
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          type: 'text' | 'audio'
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          sender_id?: string
          type?: 'text' | 'audio'
          media_url?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: 'friend_request' | 'message' | 'like'
          sender_id: string
          receiver_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'friend_request' | 'message' | 'like'
          sender_id: string
          receiver_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'friend_request' | 'message' | 'like'
          sender_id?: string
          receiver_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          updated_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
