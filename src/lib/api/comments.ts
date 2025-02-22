import { supabase } from "@/integrations/supabase/client";
import { Comment } from "@/types/post";

export async function createComment(postId: string, content: string, parentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content,
      parent_id: parentId,
      user_id: user.id
    })
    .select('*, profiles(username, avatar_url)')
    .single();

  if (error) throw error;

  // Get post owner and parent comment owner IDs
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  const { data: parentComment } = parentId ? await supabase
    .from('comments')
    .select('user_id')
    .eq('id', parentId)
    .single() : { data: null };

  // Create notification for post owner if it's a direct comment
  if (post && post.user_id !== user.id && !parentId) {
    await supabase
      .from('notifications')
      .insert({
        type: 'post_comment',
        sender_id: user.id,
        receiver_id: post.user_id,
        post_id: postId,
        comment_id: comment.id
      });
  }

  // Create notification for parent comment owner if it's a reply
  if (parentComment && parentComment.user_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        type: 'comment_reply',
        sender_id: user.id,
        receiver_id: parentComment.user_id,
        post_id: postId,
        comment_id: comment.id
      });
  }

  return comment;
}

export async function getComments(postId: string) {
  const { data: user } = await supabase.auth.getUser();
  
  let query = supabase
    .from('comments')
    .select(`
      *,
      profiles(username, avatar_url),
      likes:likes(count)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (user?.user) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('comment_id')
      .eq('user_id', user.user.id);

    const likedCommentIds = new Set(userLikes?.map(like => like.comment_id) || []);

    const { data, error } = await query;

    if (error) throw error;

    const comments = (data as Comment[]).map(comment => ({
      ...comment,
      user_has_liked: likedCommentIds.has(comment.id)
    }));

    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  } else {
    const { data, error } = await query;

    if (error) throw error;

    const comments = data as Comment[];
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  }
}
