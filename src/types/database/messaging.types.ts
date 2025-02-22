
export interface MessageTable {
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
}

export interface GroupMessageTable {
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
}
