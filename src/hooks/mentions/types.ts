
export interface MentionUser {
  id: string;
  username: string;
  avatar_url: string | null;
  relationship?: string | null;
}

export interface MentionIndices {
  start: number;
  end: number;
  query: string;
}

export interface MentionPosition {
  top: number;
  left: number;
}
