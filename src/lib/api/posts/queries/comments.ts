
import { supabase } from "@/integrations/supabase/client";
import type { Comment } from "@/types/post";
import type { ReactionType } from "@/types/database/social.types";

export async function fetchPostsComments(postIds: string[]) {
  if (!postIds.length) return [];
  
  try {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);
      
    if (error) return [];
    return commentsData || [];
  } catch (error) {
    console.error("Error fetching posts comments:", error);
    return [];
  }
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;

    // Get reactions for comments
    const commentIds = data.map(comment => comment.id);
    const { data: reactions, error: reactionsError } = await supabase
      .from('reactions')
      .select('comment_id, reaction_type')
      .in('comment_id', commentIds);
      
    if (reactionsError) console.error("Error fetching reactions:", reactionsError);
    
    // Get user reaction if logged in
    const { data: { user } } = await supabase.auth.getUser();
    let userReactions: Record<string, ReactionType | null> = {};
    
    if (user) {
      const { data: userReactionsData } = await supabase
        .from('reactions')
        .select('comment_id, reaction_type')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);
        
      if (userReactionsData) {
        userReactionsData.forEach(reaction => {
          // Cast the reaction_type to ensure it's a valid ReactionType
          userReactions[reaction.comment_id] = reaction.reaction_type as ReactionType;
        });
      }
    }
    
    // Count reactions by comment
    const reactionsCount: Record<string, number> = {};
    if (reactions) {
      reactions.forEach(reaction => {
        reactionsCount[reaction.comment_id] = (reactionsCount[reaction.comment_id] || 0) + 1;
      });
    }
    
    // Structure comments with replies
    const commentsMap: Record<string, Comment> = {};
    const topLevelComments: Comment[] = [];
    
    data.forEach(comment => {
      const processedComment: Comment = {
        ...comment,
        likes_count: reactionsCount[comment.id] || 0,
        user_reaction: userReactions[comment.id] || null,
        replies: []
      };
      
      commentsMap[comment.id] = processedComment;
      
      if (comment.parent_id === null) {
        topLevelComments.push(processedComment);
      }
    });
    
    // Add replies to parent comments
    data.forEach(comment => {
      if (comment.parent_id && commentsMap[comment.parent_id]) {
        commentsMap[comment.parent_id].replies = commentsMap[comment.parent_id].replies || [];
        commentsMap[comment.parent_id].replies?.push(commentsMap[comment.id]);
      }
    });
    
    return topLevelComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
