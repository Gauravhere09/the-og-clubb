
import { type ReactElement } from "react";

export interface NavigationLink {
  to?: string;
  icon: React.ElementType;
  label: string;
  badge?: number | null;
  onClick?: () => void;
}

export interface RealtimePostPayload {
  new: {
    id: string;
    user_id: string;
  };
}

export interface RealtimeNotification {
  new: {
    id: string;
    receiver_id: string;
    sender_id: string | null;
    message: string | null;
    read: boolean;
    created_at: string;
  };
}
