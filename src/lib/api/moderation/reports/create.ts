import { supabase } from "@/integrations/supabase/client";
import { ReportReason, ReportPostParams } from "../types";
import { tableExists } from "../utils";

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
      const { data: directReport, error: directError } = await supabase
        .from('reports' as any)
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

    const { data: recentReports, error: recentReportsError } = await supabase
      .from('reports' as any)
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
