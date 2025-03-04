
import { supabase } from "@/integrations/supabase/client";

export type ReportReason = 'spam' | 'violence' | 'hate_speech' | 'nudity' | 'other';

interface ReportPostParams {
  postId: string;
  userId: string;
  reason: ReportReason;
  description?: string;
}

export async function reportPost({ postId, userId, reason, description = '' }: ReportPostParams) {
  try {
    // Crear el reporte
    const { data: report, error: reportError } = await supabase
      .from('reports')
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

    // Verificar el número de reportes recientes (últimos 10 minutos)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const { data: recentReports, error: recentReportsError } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', postId)
      .gte('created_at', tenMinutesAgo.toISOString());

    if (recentReportsError) throw recentReportsError;

    // Si hay 5 o más reportes en los últimos 10 minutos, ocultar la publicación
    if (recentReports && recentReports.length >= 5) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ visibility: 'private' })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Crear notificación para los moderadores (esto requeriría una tabla/lógica adicional)
      console.log(`Post ${postId} has been automatically hidden due to ${recentReports.length} reports`);
    }

    return report;
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
}

export async function getPostReports(postId: string) {
  const { data, error } = await supabase
    .from('reports')
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
  return data || [];
}

export async function getReportedPosts() {
  // Obtener publicaciones que tienen al menos un reporte pendiente
  const { data, error } = await supabase
    .from('reports')
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
    .group('post_id, posts!reports_post_id_fkey (id, content, user_id, media_url, media_type, created_at, profiles (username, avatar_url))')
    .order('count', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'ignored' | 'accepted') {
  const { data, error } = await supabase
    .from('reports')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select();

  if (error) throw error;
  return data;
}

// Función para que los moderadores puedan revisar y actuar sobre los reportes
export async function handleReportedPost(postId: string, action: 'approve' | 'reject' | 'delete') {
  try {
    switch (action) {
      case 'approve':
        // Mantener la publicación y marcar los reportes como ignorados
        await supabase
          .from('reports')
          .update({ 
            status: 'ignored',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Restaurar la visibilidad si estaba oculta
        await supabase
          .from('posts')
          .update({ visibility: 'public' })
          .eq('id', postId);
        break;

      case 'reject':
        // Marcar los reportes como aceptados
        await supabase
          .from('reports')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString() 
          })
          .eq('post_id', postId);
        
        // Mantener la publicación oculta
        await supabase
          .from('posts')
          .update({ visibility: 'private' })
          .eq('id', postId);
        break;

      case 'delete':
        // Eliminar la publicación por completo
        await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        // Marcar los reportes como aceptados
        await supabase
          .from('reports')
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
