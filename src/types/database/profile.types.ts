
export interface ProfileTable {
  Row: {
    id: string;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    career: string | null;
    semester: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    career?: string | null;
    semester?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    username?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    cover_url?: string | null;
    career?: string | null;
    semester?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

