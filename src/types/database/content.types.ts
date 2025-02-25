
export interface PostTable {
  Row: {
    id: string;
    content: string;
    user_id: string;
    media_url: string | null;
    media_type: 'image' | 'video' | 'audio' | null;
    visibility: 'public' | 'friends' | 'private';
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    content: string;
    user_id: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    visibility?: 'public' | 'friends' | 'private';
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    content?: string;
    user_id?: string;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'audio' | null;
    visibility?: 'public' | 'friends' | 'private';
    created_at?: string;
    updated_at?: string;
  };
}

export interface CommentTable {
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
}
