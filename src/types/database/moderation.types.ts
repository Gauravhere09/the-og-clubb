
export interface ReportTable {
  Row: {
    id: string;
    post_id: string;
    user_id: string;
    reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description: string | null;
    status: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at: string;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    post_id: string;
    user_id: string;
    reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description?: string | null;
    status?: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at?: string;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    post_id?: string;
    user_id?: string;
    reason?: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';
    description?: string | null;
    status?: 'pending' | 'reviewed' | 'ignored' | 'accepted';
    created_at?: string;
    updated_at?: string | null;
  };
}
