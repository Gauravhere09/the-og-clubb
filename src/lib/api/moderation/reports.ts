import { supabase } from "@/integrations/supabase/client";
import { ReportedPost, ReportWithUser } from "@/types/database/moderation.types";

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
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

/**
 * Creates a new report for a post
 */
export async function createReport(
  postId: string, 
  userId: string, 
  reason: 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other', 
  description?: string
) {
  try {
    // Insert the report into the database
    const { data, error } = await supabase
      .from('reports' as any)
      .insert({
        post_id: postId,
        user_id: userId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Check if the post has 5 or more reports in the last 10 minutes
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { count, error: countError } = await supabase
      .from('reports' as any)
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .gte('created_at', tenMinutesAgo.toISOString());

    if (countError) throw countError;

    // If the post has 5 or more reports in the last 10 minutes, automatically hide it
    if (count && count >= 5) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ visibility: 'private' })
        .eq('id', postId);

      if (updateError) throw updateError;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating report:', error);
    return { success: false, error };
  }
}

export async function reportPost({ postId, userId, reason, description = '' }: ReportPostParams) {
  try {
    // Check if the reports table exists
    const exists = await tableExists('reports');
    if (!exists) {
      throw new Error("La tabla 'reports' no existe. Por favor, crea la tabla primero.");
    }

    // Create report in the database using raw query to avoid type errors
    let reportData;
    const { data: report, error: reportError } = await supabase
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

      if (directError) throw directError;
      reportData = directReport;
    } else {
      reportData = report;
    }

    // Check number of recent reports (last 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    // Use raw query to avoid type errors
    const { data: recentReports, error: recentReportsError } = await supabase.from('reports' as any)
      .select('id')
      .eq('post_id', postId)
      .gte('created_at', tenMinutesAgo.toISOString());

    if (recentReportsError) throw recentReportsError;

    // If there are 5 or more reports in the last 10 minutes, hide the post
    if (recentReports && recentReports.length >= 5) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ visibility: 'private' })
        .eq('id', postId);

      if (updateError) throw updateError;

      console.log(`Post ${postId} has been automatically hidden due to ${recentReports.length} reports`);
    }

    return reportData;
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
}

/**
 * Gets a list of all reports for a specific post
 */
export async function getReportsForPost(postId: string): Promise<ReportWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('reports' as any)
      .select(`
        *,
        user:profiles(username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Type assertion to handle TypeScript issues
    return (data || []) as unknown as ReportWithUser[];
  } catch (error) {
    console.error('Error fetching reports for post:', error);
    return [];
  }
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

/**
 * Gets a summary of all reported posts with count
 */
export async function getReportedPosts(): Promise<ReportedPost[]> {
  try {
    // Get a list of all post IDs that have pending reports
    const { data: reportedPostIds, error: reportedPostsError } = await supabase
      .from('reports' as any)
      .select('post_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (reportedPostsError) throw reportedPostsError;

    if (!reportedPostIds || reportedPostIds.length === 0) {
      return [];
    }

    // Get unique post IDs (a post may have multiple reports)
    const uniquePostIds = [...new Set(reportedPostIds.map((r: any) => r.post_id))];

    // For each unique post ID, get the post details and count of reports
    const reportedPosts: ReportedPost[] = [];
    
    for (const postId of uniquePostIds) {
      // Get the count of reports for this post
      const { count, error: countError } = await supabase
        .from('reports' as any)
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (countError) throw countError;

      // Get the post details
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          media_url,
          media_type,
          created_at,
          profiles:profiles(username, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (postError) {
        // If the post doesn't exist, skip it
        if (postError.code === 'PGRST116') continue;
        throw postError;
      }

      reportedPosts.push({
        post_id: postId,
        count: count || 0,
        posts: postData
      });
    }

    return reportedPosts;
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    return [];
  }
}

/**
 * Updates the status of a report
 */
export async function updateReportStatus(
  reportId: string, 
  status: 'pending' | 'reviewed' | 'ignored' | 'accepted'
) {
  try {
    const { data, error } = await supabase
      .from('reports' as any)
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error };
  }
}

/**
 * Updates all reports for a specific post
 */
export async function updateAllReportsForPost(
  postId: string, 
  status: 'pending' | 'reviewed' | 'ignored' | 'accepted'
) {
  try {
    const { data, error } = await supabase
      .from('reports' as any)
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('post_id', postId)
      .select();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating reports for post:', error);
    return { success: false, error };
  }
}

/**
 * Hides or shows a post
 */
export async function togglePostVisibility(postId: string, isHidden: boolean) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({ visibility: isHidden ? 'private' : 'public' })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error toggling post visibility:', error);
    return { success: false, error };
  }
}

/**
 * Deletes a post and all its reports
 */
export async function deleteReportedPost(postId: string) {
  try {
    // First update all reports for this post to 'reviewed'
    await updateAllReportsForPost(postId, 'reviewed');
    
    // Then delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting reported post:', error);
    return { success: false, error };
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
