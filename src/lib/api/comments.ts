
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
        comment_id: comment.id,
        message: 'Ha comentado en tu publicación'
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
        comment_id: comment.id,
        message: 'Ha respondido a tu comentario'
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
      profiles(username, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  // Obtenemos los datos de comentarios
  const { data, error } = await query;
  if (error) throw error;
  
  let comments = data as Comment[];
  
  // Si hay un usuario autenticado, obtiene sus reacciones
  if (user?.user) {
    // Obtener las reacciones del usuario a los comentarios
    const commentIds = comments.map(comment => comment.id);
    
    if (commentIds.length > 0) {
      const { data: userReactions } = await supabase
        .from('reactions')
        .select('comment_id, reaction_type')
        .eq('user_id', user.user.id)
        .in('comment_id', commentIds);
      
      // Crear un mapa de reacciones por id de comentario
      const reactionsByCommentId = new Map();
      if (userReactions) {
        userReactions.forEach(reaction => {
          reactionsByCommentId.set(reaction.comment_id, reaction.reaction_type);
        });
      }
      
      // Obtener el conteo de reacciones para cada comentario
      const { data: reactionCounts } = await supabase
        .from('reactions')
        .select('comment_id, count(*)')
        .in('comment_id', commentIds)
        .group('comment_id');
        
      const countByCommentId = new Map();
      if (reactionCounts) {
        reactionCounts.forEach(count => {
          countByCommentId.set(count.comment_id, parseInt(count.count, 10));
        });
      }
      
      // Añadir la reacción del usuario y el conteo a cada comentario
      comments = comments.map(comment => ({
        ...comment,
        user_reaction: reactionsByCommentId.get(comment.id) || null,
        likes_count: countByCommentId.get(comment.id) || 0
      }));
    }
  }

  // Organizar comentarios en jerarquía (comentarios padres y respuestas)
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent && parent.replies) {
        parent.replies.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return rootComments;
}
