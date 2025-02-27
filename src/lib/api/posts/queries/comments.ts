
import { supabase } from "@/integrations/supabase/client";

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
