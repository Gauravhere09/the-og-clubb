
import { supabase } from "@/integrations/supabase/client";
import { ReportWithUser } from "@/types/database/moderation.types";

export type ReportReason = 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';

interface ReportPostParams {
  postId: string;
  userId: string;
  reason: ReportReason;
  description?: string;
}

// Helper function to check if table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    // Use any type to bypass type checking for tables that might not be in the schema
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

export async function createReport(
  postId: string,
  userId: string,
  reason: ReportReason,
  description: string = ''
) {
  try {
    // Check if reports table exists
    const exists = await tableExists('reports');
    if (!exists) {
      return { success: false, error: "La tabla 'reports' no existe" };
    }

    // Create report in the database using raw query to avoid type errors
    let reportData;
    const { data, error: reportError } = await supabase
      .rpc('create_report', {
        p_post_id: postId,
        p_user_id: userId,
        p_reason: reason,
        p_description: description
      });

    if (reportError) {
      // Fallback to direct query if RPC doesn't exist
      const { data: directReport, error: directError } = await supabase.from('reports' as any)
        .insert({
          post_id: postId,
          user_id: userId,
          reason,
          description,
          status: 'pending',
        })
        .select();

      if (directError) {
        return { success: false, error: directError.message };
      }
      reportData = directReport;
    } else {
      reportData = data;
    }

    // Check if we need to auto-hide the post (5+ reports in 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentReports, error: recentReportsError } = await supabase.from('reports' as any)
      .select('id')
      .eq('post_id', postId)
      .gte('created_at', tenMinutesAgo.toISOString());

    if (!recentReportsError && recentReports && recentReports.length >= 5) {
      await supabase
        .from('posts')
        .update({ visibility: 'private' })
        .eq('id', postId);
    }

    return { success: true, data: reportData };
  } catch (error: any) {
    console.error("Error creating report:", error);
    return { success: false, error: error.message };
  }
}

// Keeping for backward compatibility
export function reportPost(params: ReportPostParams) {
  return createReport(params.postId, params.userId, params.reason, params.description);
}

export async function getPostReports(postId: string): Promise<ReportWithUser[]> {
  try {
    // Use raw query to avoid type errors
    const { data, error } = await supabase.from('reports' as any)
      .select(`
        *,
        user:profiles!reports_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the data to match the ReportWithUser interface
    const transformedData: ReportWithUser[] = (data || []).map(item => ({
      id: item.id,
      post_id: item.post_id,
      user_id: item.user_id,
      reason: item.reason as ReportReason,
      description: item.description,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: item.user || { username: null, avatar_url: null }
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching post reports:', error);
    return [];
  }
}

export async function getReportedPosts() {
  try {
    // Use raw query to avoid type errors
    const { data, error } = await supabase.from('reports' as any)
      .select(`
        post_id,
        count:id(count),
        posts!reports_post_id_fkey (
          id,
          content,
          user_id,
          media_url,
          media_type,
          created_at,
          profiles (
            username,
            avatar_url
          )
        )
      `)
      .eq('status', 'pending')
      .or('post_id.is.not.null')
      .order('count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    return [];
  }
}

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
