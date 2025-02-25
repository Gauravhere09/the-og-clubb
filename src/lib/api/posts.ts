
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

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        media_url,
        media_type,
        poll,
        user_id: user.id,
        visibility: 'public'
      } as Tables['posts']['Insert'])
      .select(`
        *,
        profiles(username, avatar_url),
        (
          SELECT COUNT(*)::integer
          FROM comments
          WHERE post_id = posts.id
        ) as comments_count,
        (
          SELECT json_build_object(
            'count', COUNT(*)::integer,
            'by_type', json_object_agg(reaction_type, COUNT(*))
          )
          FROM reactions
          WHERE post_id = posts.id
          GROUP BY post_id
        ) as reactions,
        (
          SELECT reaction_type
          FROM reactions
          WHERE post_id = posts.id AND user_id = $1
          LIMIT 1
        ) as user_reaction
      `)
      .single({
        count: 'exact'
      })
      .eq('user_id', user.id);

    if (error) throw error;

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
        post_id: post.id,
        message: 'Ha realizado una nueva publicación',
        read: false
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    return post as unknown as Post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(userId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles(username, avatar_url),
      (
        SELECT COUNT(*)::integer
        FROM comments
        WHERE post_id = posts.id
      ) as comments_count,
      (
        SELECT json_build_object(
          'count', COUNT(*)::integer,
          'by_type', json_object_agg(reaction_type, COUNT(*))
        )
        FROM reactions
        WHERE post_id = posts.id
        GROUP BY post_id
      ) as reactions
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: postsData, error: postsError } = await query;

  if (postsError) throw postsError;

  // Get user's reactions if logged in
  let userReactionsMap = {};
  if (user?.user) {
    const { data: userReactions } = await supabase
      .from('reactions')
      .select('post_id, reaction_type')
      .eq('user_id', user.user.id);

    userReactionsMap = (userReactions || []).reduce((acc, reaction) => {
      acc[reaction.post_id] = reaction.reaction_type;
      return acc;
    }, {} as Record<string, string>);
  }

  // Transform posts data
  return (postsData || []).map((post) => ({
    ...post,
    media_type: post.media_type as 'image' | 'video' | 'audio' | null,
    visibility: post.visibility as 'public' | 'friends' | 'private',
    poll: post.poll ? {
      question: post.poll.question,
      options: post.poll.options.map((opt: any) => ({
        id: opt.id,
        content: opt.content,
        votes: opt.votes
      })),
      total_votes: post.poll.total_votes,
      user_vote: post.poll.user_vote
    } : null,
    user_reaction: userReactionsMap[post.id] || null,
    reactions: post.reactions || { count: 0, by_type: {} },
    reactions_count: post.reactions?.count || 0,
    comments_count: post.comments_count || 0
  })) as Post[];
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
