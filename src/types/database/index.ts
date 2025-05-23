
import { ProfileTable } from './profile.types';
import { ReactionTable, FriendshipTable, NotificationTable } from './social.types';
import { PostTable, CommentTable } from './content.types';
import { MessageTable, GroupMessageTable } from './messaging.types';
import { ReportTable } from './moderation.types';

export interface Database {
  public: {
    Tables: {
      profiles: ProfileTable;
      reactions: ReactionTable;
      friendships: FriendshipTable;
      posts: PostTable;
      comments: CommentTable;
      messages: MessageTable;
      group_messages: GroupMessageTable;
      notifications: NotificationTable;
      reports: ReportTable;
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
