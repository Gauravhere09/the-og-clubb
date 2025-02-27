
import { supabase } from "@/integrations/supabase/client";
import { Post, Poll } from "@/types/post";
import { Tables } from "@/types/database";
import { transformPoll } from "./utils";

export async function fetchPostById(postId: string): Promise<Post | null> {
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      user_id,
      media_url,
      media_type,
      visibility,
      poll,
      created_at,
      updated_at,
      shared_from,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single();

  if (error) return null;

  // Transform to Post type
  return {
    id: post.id,
    content: post.content ?? '',
    user_id: post.user_id,
    media_url: post.media_url,
    media_type: post.media_type as Post['media_type'],
    visibility: post.visibility as Post['visibility'],
    created_at: post.created_at,
    updated_at: post.updated_at,
    profiles: post.profiles,
    poll: transformPoll(post.poll),
    shared_from: post.shared_from,
    shared_post: null,
    reactions: { count: 0, by_type: {} },
    reactions_count: 0,
    comments_count: 0
  };
}

export async function fetchSharedPosts(sharedPostIds: string[]): Promise<Record<string, any>> {
  if (!sharedPostIds.length) return {};
  
  const { data: sharedPosts } = await supabase
    .from('posts')
    .select(`
      id,
      content,
      user_id,
      media_url,
      media_type,
      visibility,
      poll,
      created_at,
      updated_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .in('id', sharedPostIds);
    
  if (!sharedPosts?.length) return {};
  
  return sharedPosts.reduce((acc, post) => {
    acc[post.id] = post;
    return acc;
  }, {} as Record<string, any>);
}

export async function fetchPostsReactions(postIds: string[]) {
  if (!postIds.length) return [];
  
  const { data: reactionsData } = await supabase
    .from('reactions')
    .select('post_id, reaction_type')
    .in('post_id', postIds);
    
  return reactionsData || [];
}

export async function fetchPostsComments(postIds: string[]) {
  if (!postIds.length) return [];
  
  const { data: commentsData } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);
    
  return commentsData || [];
}

export async function fetchUserReactions(userId: string, postIds: string[]) {
  if (!userId || !postIds.length) return {};
  
  const { data: userReactions } = await supabase
    .from('reactions')
    .select('post_id, reaction_type')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (!userReactions) return {};
  
  return userReactions.reduce((acc, reaction) => {
    acc[reaction.post_id] = reaction.reaction_type;
    return acc;
  }, {} as Record<string, string>);
}

export async function fetchUserPollVotes(userId: string) {
  if (!userId) return {};
  
  const { data: votesData } = await supabase
    .from('poll_votes')
    .select('post_id, option_id')
    .eq('user_id', userId);

  if (!votesData) return {};
  
  return votesData.reduce((acc, vote) => {
    acc[vote.post_id] = vote.option_id;
    return acc;
  }, {} as Record<string, string>);
}
