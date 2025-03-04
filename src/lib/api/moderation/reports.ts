import { supabase } from "@/integrations/supabase/client";
import { ReportWithUser } from "@/types/database/moderation.types";

export type ReportReason = 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';

interface ReportPostParams {
  postId: string;
  userId: string;
  reason: ReportReason;
  description?: string;
}

export async function reportPost({ postId, userId, reason, description = '' }: ReportPostParams) {
  try {
    // Create report in the database
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        post_id: postId,
        user_id: userId,
        reason,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // Check number of recent reports (last 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentReports, error: recentReportsError } = await supabase
      .from("reports")
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

      // Create notification for moderators (this would require additional table/logic)
      console.log(`Post ${postId} has been automatically hidden due to ${recentReports.length} reports`);
    }

    return report;
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
}

export async function getPostReports(postId: string): Promise<ReportWithUser[]> {
  const { data, error } = await supabase
    .from("reports")
    .select(`
      id,
      post_id,
      user_id,
      reason,
      description,
      status,
      created_at,
      updated_at,
      user:profiles!reports_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform the data to match the ReportWithUser interface
  const transformedData = data?.map(item => ({
    id: item.id,
    post_id: item.post_id,
    user_id: item.user_id,
    reason: item.reason as ReportReason,
    description: item.description,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    user: item.user
  })) || [];
  
  return transformedData;
}

export async function getReportedPosts() {
  // Get posts that have at least one pending report
  const { data, error } = await supabase
    .from("reports")
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
    .or('post_id.not.is.null')
    .order('count', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'ignored' | 'accepted') {
  const { data, error } = await supabase
    .from("reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select();

  if (error) throw error;
  return data;
}

// Function for moderators to review and act on reports
export async function handleReportedPost(postId: string, action: 'approve' | 'reject' | 'delete') {
  try {
    switch (action) {
      case 'approve':
        // Keep the post and mark reports as ignored
        await supabase
          .from("reports")
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
        await supabase
          .from("reports")
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
        await supabase
          .from("reports")
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
