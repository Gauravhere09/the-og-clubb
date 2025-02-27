
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";
import { transformPoll } from "./utils";
import { uploadMediaFile, getMediaType } from "./storage";
import { sendNewPostNotifications } from "./notifications";
import { 
  fetchSharedPosts, 
  fetchPostsReactions, 
  fetchPostsComments, 
  fetchUserReactions,
  fetchUserPollVotes 
} from "./queries";
import { CreatePostParams } from "./types";

export async function createPost({
  content, 
  file = null,
  pollData
}: CreatePostParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    let media_url = null;
    let media_type = null;

    if (file) {
      media_url = await uploadMediaFile(file);
      media_type = getMediaType(file);
    }

    let poll = null;
    if (pollData) {
      poll = {
        question: pollData.question,
        options: pollData.options.map((content, index) => ({
          id: crypto.randomUUID(),
          content,
          votes: 0
        })),
        total_votes: 0,
        user_vote: null
      };
    }

    const insertData = {
      content,
      media_url,
      media_type,
      poll,
      user_id: user.id,
      visibility: 'public'
    } as Tables['posts']['Insert'];

    // First insert the post
    try {
      const { data: rawPost, error: insertError } = await supabase
        .from('posts')
        .insert(insertData)
        .select(`
          id,
          content,
          user_id,
          media_url,
          media_type,
          visibility,
          poll,
          created_at,
          updated_at
        `)
        .single();

      if (insertError) throw insertError;
      if (!rawPost) throw new Error('Failed to create post');

      // Then get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Send notifications to friends
      await sendNewPostNotifications(user.id, rawPost.id);

      // Transform the raw post to match Post type
      const post: Post = {
        id: rawPost.id,
        content: rawPost.content || '',
        user_id: rawPost.user_id,
        media_url: rawPost.media_url,
        media_type: rawPost.media_type as 'image' | 'video' | 'audio' | null,
        visibility: rawPost.visibility as 'public' | 'friends' | 'private',
        created_at: rawPost.created_at,
        updated_at: rawPost.updated_at,
        shared_from: null,
        profiles: profileData,
        poll: transformPoll(rawPost.poll),
        reactions: { count: 0, by_type: {} },
        reactions_count: 0,
        comments_count: 0
      };

      return post;
    } catch (err) {
      console.error("Error in post creation:", err);
      throw err;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(userId?: string) {
  try {
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

    // Since shared_from doesn't exist in the DB, we'll ignore it for now
    const sharedPostIds: string[] = [];
    
    // Get reactions data
    const reactionsData = await fetchPostsReactions(rawPosts.map(p => p.id));

    // Get comments count
    const commentsData = await fetchPostsComments(rawPosts.map(p => p.id));

    // Get user reactions if logged in
    let userReactionsMap: Record<string, string> = {};
    let votesMap: Record<string, string> = {};
    
    if (user) {
      userReactionsMap = await fetchUserReactions(user.id, rawPosts.map(p => p.id));

      // Get user's poll votes
      if (rawPosts.some(post => post.poll)) {
        votesMap = await fetchUserPollVotes(user.id);
        
        // Update poll data with user votes
        rawPosts.forEach(post => {
          if (post.poll && typeof post.poll === 'object') {
            post.poll.user_vote = votesMap[post.id] || null;
          }
        });
      }
    }

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

    // Count comments
    const commentsCountMap = commentsData.reduce((acc, comment) => {
      acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transform posts data
    return rawPosts.map((post): Post => ({
      id: post.id,
      content: post.content || '',
      user_id: post.user_id,
      media_url: post.media_url,
      media_type: post.media_type as Post['media_type'],
      visibility: post.visibility as Post['visibility'],
      created_at: post.created_at,
      updated_at: post.updated_at,
      profiles: post.profiles,
      poll: transformPoll(post.poll),
      shared_from: null,
      shared_post: null,
      user_reaction: userReactionsMap[post.id] as Post['user_reaction'],
      reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
      reactions_count: reactionsMap[post.id]?.count || 0,
      comments_count: commentsCountMap[post.id] || 0
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
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

// Re-export functions from other files for backward compatibility
export * from "./types";
export * from "./utils";
export * from "./storage";
export * from "./notifications";
export * from "./queries";
