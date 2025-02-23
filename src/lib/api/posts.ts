import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";

export async function createPost(content: string, file: File | null = null) {
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
                   file.type.startsWith('audio/') || file.type === 'audio/webm' ? 'audio' : null;
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content,
        media_url,
        media_type,
        user_id: user.id,
        visibility: 'public'
      } as Tables['posts']['Insert'])
      .select('*, profiles(username, avatar_url)')
      .single();

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
  const { data: user } = await supabase.auth.getUser();
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles(username, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: postsData, error: postsError } = await query;

  if (postsError) throw postsError;

  // Fetch all comments
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", (postsData || []).map(p => p.id));

  if (commentsError) throw commentsError;

  // Fetch all reactions
  const { data: reactionsData, error: reactionsError } = await supabase
    .from("reactions")
    .select("post_id, reaction_type")
    .in("post_id", (postsData || []).map(p => p.id));

  if (reactionsError) throw reactionsError;

  // Count comments manually
  const commentsMap = (commentsData || []).reduce((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count reactions manually
  const reactionsMap = (reactionsData || []).reduce((acc, reaction) => {
    if (!acc[reaction.post_id]) {
      acc[reaction.post_id] = {
        count: 0,
        by_type: {}
      };
    }
    acc[reaction.post_id].count += 1;
    acc[reaction.post_id].by_type[reaction.reaction_type] = 
      (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number, by_type: Record<string, number> }>);

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

  // Combine all data
  return (postsData || []).map((post) => ({
    ...post,
    media_type: post.media_type as 'image' | 'video' | 'audio' | null,
    visibility: post.visibility as 'public' | 'friends' | 'private',
    user_reaction: userReactionsMap[post.id] || null,
    reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
    reactions_count: reactionsMap[post.id]?.count || 0,
    comments_count: commentsMap[post.id] || 0
  }));
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
