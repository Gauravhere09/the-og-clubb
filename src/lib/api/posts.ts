import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";

export async function createPost(
  content: string, 
  file: File | null = null,
  pollData?: { question: string; options: string[] }
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    let media_url = null;
    let media_type = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      media_url = publicUrl;
      media_type = file.type.startsWith('image/') ? 'image' :
                   file.type.startsWith('video/') ? 'video' :
                   file.type.startsWith('audio/') ? 'audio' : null;
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

    // Then get the profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!rawPost) throw new Error('Failed to create post');

    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (friendships && friendships.length > 0) {
      const notifications = friendships.map(friendship => ({
        type: 'new_post',
        sender_id: user.id,
        receiver_id: friendship.friend_id,
        post_id: rawPost.id,
        message: 'Ha realizado una nueva publicación',
        read: false
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    // Transform the raw post to match Post type
    const post: Post = {
      id: rawPost.id,
      content: rawPost.content,
      user_id: rawPost.user_id,
      media_url: rawPost.media_url,
      media_type: rawPost.media_type as 'image' | 'video' | 'audio' | null,
      visibility: rawPost.visibility as 'public' | 'friends' | 'private',
      created_at: rawPost.created_at,
      updated_at: rawPost.updated_at,
      profiles: profileData,
      poll: rawPost.poll ? {
        question: (rawPost.poll as any).question as string,
        options: ((rawPost.poll as any).options || []).map((opt: any) => ({
          id: opt.id as string,
          content: opt.content as string,
          votes: opt.votes as number
        })),
        total_votes: (rawPost.poll as any).total_votes as number,
        user_vote: (rawPost.poll as any).user_vote as string | null
      } : null,
      reactions: { count: 0, by_type: {} },
      reactions_count: 0,
      comments_count: 0
    };

    return post;
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

  // Get reactions data
  const { data: reactionsData } = await supabase
    .from('reactions')
    .select('post_id, reaction_type')
    .in('post_id', (rawPosts || []).map(p => p.id));

  // Get comments count
  const { data: commentsData } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', (rawPosts || []).map(p => p.id));

  // Get user reactions if logged in
  let userReactionsMap: Record<string, string> = {};
  if (user) {
    const { data: userReactions } = await supabase
      .from('reactions')
      .select('post_id, reaction_type')
      .eq('user_id', user.id)
      .in('post_id', (rawPosts || []).map(p => p.id));

    if (userReactions) {
      userReactionsMap = userReactions.reduce((acc, reaction) => {
        acc[reaction.post_id] = reaction.reaction_type;
        return acc;
      }, {} as Record<string, string>);
    }

    // Get user's poll votes
    const { data: userVotes } = await supabase
      .from('poll_votes')
      .select('post_id, option_id')
      .eq('user_id', user.id)
      .in('post_id', (rawPosts || []).map(p => p.id));

    if (userVotes) {
      rawPosts?.forEach(post => {
        if (post.poll) {
          const userVote = userVotes.find(vote => vote.post_id === post.id);
          if (userVote) {
            post.poll.user_vote = userVote.option_id;
          }
        }
      });
    }
  }

  // Process reactions data
  const reactionsMap = (reactionsData || []).reduce((acc, reaction) => {
    if (!acc[reaction.post_id]) {
      acc[reaction.post_id] = { count: 0, by_type: {} };
    }
    acc[reaction.post_id].count++;
    acc[reaction.post_id].by_type[reaction.reaction_type] = 
      (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number; by_type: Record<string, number> }>);

  // Count comments
  const commentsCountMap = (commentsData || []).reduce((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transform posts data
  const transformedPosts = (rawPosts || []).map((post: any): Post => {
    // Transform poll data if it exists
    let transformedPoll = null;
    if (post.poll) {
      transformedPoll = {
        question: post.poll.question,
        options: post.poll.options.map((opt: any) => ({
          id: opt.id,
          content: opt.content,
          votes: Number(opt.votes)
        })),
        total_votes: Number(post.poll.total_votes),
        user_vote: post.poll.user_vote
      };
    }

    return {
      id: post.id,
      content: post.content,
      user_id: post.user_id,
      media_url: post.media_url,
      media_type: post.media_type,
      visibility: post.visibility,
      created_at: post.created_at,
      updated_at: post.updated_at,
      profiles: post.profiles,
      poll: transformedPoll,
      user_reaction: userReactionsMap[post.id] || null,
      reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
      reactions_count: reactionsMap[post.id]?.count || 0,
      comments_count: commentsCountMap[post.id] || 0
    };
  });

  return transformedPosts;
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
