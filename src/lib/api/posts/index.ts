
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";
import { CreatePostInput, RawPost } from "./types";
import { createPollData, processMediaFile, transformRawPost } from "./utils";
import { uploadMedia } from "./storage";
import { notifyFriendsAboutPost } from "./notifications";
import { getPostsReactions, getPostsComments, getUserReactions, getProfileData } from "./queries";

export async function createPost(content: string, file: File | null = null, pollData?: { question: string; options: string[] }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    let media_url = null;
    let media_type = null;

    if (file) {
      media_url = await uploadMedia(file);
      const mediaInfo = processMediaFile(file);
      media_type = mediaInfo.media_type;
    }

    const poll = pollData ? createPollData(pollData.question, pollData.options) : null;

    const insertData = {
      content,
      media_url,
      media_type,
      poll,
      user_id: user.id,
      visibility: 'public'
    } as Tables['posts']['Insert'];

    const { data: rawPost, error: insertError } = await supabase
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    if (insertError || !rawPost) throw insertError || new Error('Failed to create post');

    const profileData = await getProfileData(user.id);
    await notifyFriendsAboutPost(user.id, rawPost.id);

    return transformRawPost(rawPost as RawPost, profileData);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(userId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const query = supabase
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
    `);

  if (userId) {
    query.eq('user_id', userId);
  }

  const { data: rawPosts, error: postsError } = await query
    .order('created_at', { ascending: false });

  if (postsError) throw postsError;
  if (!rawPosts) return [];

  const postIds = rawPosts.map(p => p.id);

  // Get all related data
  const [reactionsData, commentsData, userReactions] = await Promise.all([
    getPostsReactions(postIds),
    getPostsComments(postIds),
    user ? getUserReactions(user.id, postIds) : Promise.resolve([])
  ]);

  // Process reactions data
  const reactionsMap = reactionsData.reduce((acc, reaction) => {
    if (!acc[reaction.post_id]) {
      acc[reaction.post_id] = { count: 0, by_type: {} };
    }
    acc[reaction.post_id].count++;
    acc[reaction.post_id].by_type[reaction.reaction_type] = 
      (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number; by_type: Record<string, number> }>);

  // Process user reactions
  const userReactionsMap = userReactions.reduce((acc, reaction) => {
    acc[reaction.post_id] = reaction.reaction_type;
    return acc;
  }, {} as Record<string, string>);

  // Count comments
  const commentsCountMap = commentsData.reduce((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transform posts data
  return rawPosts.map((post) => 
    transformRawPost(
      post as RawPost,
      undefined,
      reactionsMap,
      userReactionsMap,
      commentsCountMap
    )
  );
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function updatePostVisibility(postId: string, visibility: 'public' | 'friends' | 'private') {
  const { error } = await supabase
    .from('posts')
    .update({ visibility })
    .eq('id', postId);

  if (error) throw error;
}
