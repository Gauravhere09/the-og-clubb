
export interface NotificationTable {
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
}
