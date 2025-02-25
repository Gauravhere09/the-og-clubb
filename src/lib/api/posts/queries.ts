
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";
import { RawPost, ReactionType } from "./types";
import { transformRawPost } from "./utils";

export async function getPostsReactions(postIds: string[]) {
  const { data: reactionsData } = await supabase
    .from('reactions')
    .select('post_id, reaction_type')
    .in('post_id', postIds);

  return (reactionsData || []).map(r => ({
    ...r,
    reaction_type: r.reaction_type as ReactionType
  }));
}

export async function getPostsComments(postIds: string[]) {
  const { data: commentsData } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  return commentsData || [];
}

export async function getUserReactions(userId: string, postIds: string[]) {
  const { data: userReactions } = await supabase
    .from('reactions')
    .select('post_id, reaction_type')
    .eq('user_id', userId)
    .in('post_id', postIds);

  return (userReactions || []).map(r => ({
    ...r,
    reaction_type: r.reaction_type as ReactionType
  }));
}

export async function getProfileData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
