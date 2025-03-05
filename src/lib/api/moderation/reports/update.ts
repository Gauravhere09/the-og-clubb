import { supabase } from "@/integrations/supabase/client";

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'ignored' | 'accepted') {
  try {
    // Use raw query to avoid type errors
    const { data, error } = await supabase.from('reports' as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}

// Function for moderators to review and act on reports
export async function handleReportedPost(postId: string, action: 'approve' | 'reject' | 'delete') {
  try {
    switch (action) {
      case 'approve':
        // Keep the post and mark reports as ignored
        await supabase.from('reports' as any)
          .update({ 
            status: 'ignored',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Restore visibility if hidden
        await supabase
          .from('posts')
          .update({ visibility: 'public' })
          .eq('id', postId);
        break;

      case 'reject':
        // Mark reports as accepted
        await supabase.from('reports' as any)
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Keep the post hidden
        await supabase
          .from('posts')
          .update({ visibility: 'private' })
          .eq('id', postId);
        break;

      case 'delete':
        // Delete the post completely
        await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        // Mark reports as accepted
        await supabase.from('reports' as any)
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        break;
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling reported post:', error);
    throw error;
  }
}
