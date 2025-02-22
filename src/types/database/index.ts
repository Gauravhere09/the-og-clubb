
import { ProfileTable } from './profile.types';
import { LikeTable, FriendshipTable, FriendRequestTable } from './social.types';
import { PostTable, CommentTable } from './content.types';
import { MessageTable, GroupMessageTable } from './messaging.types';
import { NotificationTable } from './notification.types';

export interface Database {
  public: {
    Tables: {
      profiles: ProfileTable;
      likes: LikeTable;
      friendships: FriendshipTable;
      friends: FriendshipTable;
      friend_requests: FriendRequestTable;
      posts: PostTable;
      comments: CommentTable;
      messages: MessageTable;
      group_messages: GroupMessageTable;
      notifications: NotificationTable;
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
