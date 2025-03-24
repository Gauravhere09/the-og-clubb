
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { Tables } from "@/types/database";
import { transformPoll } from "./utils";
import { uploadMediaFile, getMediaType } from "./storage";
import { sendNewPostNotifications, sendMentionNotifications } from "./notifications";
import { CreatePostParams } from "./types";

export async function createPost({
  content, 
  file = null,
  pollData,
  visibility = 'public'
}: CreatePostParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    let media_url = null;
    let media_type = null;

    if (file) {
      media_url = await uploadMediaFile(file);
      media_type = getMediaType(file);
    }

    let poll = null;
    if (pollData) {
      poll = {
        question: pollData.question,
        options: pollData.options.map((content, index) => ({
          id: crypto.randomUUID(),
          content,
          votes: 0
        })),
        total_votes: 0,
        user_vote: null
      };
    }

    // Map the visibility value to match what's expected in the database
    // UI uses "incognito" but database expects "private"
    const dbVisibility: 'public' | 'friends' | 'private' = 
      visibility === 'incognito' ? 'private' : 
      visibility === 'public' ? 'public' : 
      'friends';

    const insertData = {
      content,
      media_url,
      media_type,
      poll,
      user_id: user.id,
      visibility: dbVisibility
    };

    // First insert the post
    try {
      const { data: rawPost, error: insertError } = await supabase
        .from('posts')
        .insert(insertData)
        .select(`
          id,
          content,
          user_id,
          media_url,
          media_type,
          visibility,
          poll,
          created_at,
          updated_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (insertError) throw insertError;
      if (!rawPost) throw new Error('Failed to create post');

      // Then get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Procesar menciones en el contenido y enviar notificaciones
      await sendMentionNotifications(content, rawPost.id, null, user.id);

      // Send notifications to friends
      if (visibility !== 'incognito') {
        await sendNewPostNotifications(user.id, rawPost.id);
      }

      // Map back from db visibility to UI visibility
      const uiVisibility = rawPost.visibility === 'private' ? 'incognito' : rawPost.visibility;
      
      // Determinar si esta es una publicación incógnito
      const isIncognito = uiVisibility === 'incognito';

      // Transform the raw post to match Post type
      const post: Post = {
        id: rawPost.id,
        content: rawPost.content || '',
        user_id: isIncognito ? 'anonymous' : rawPost.user_id, // Para incógnito, usar un ID genérico
        media_url: rawPost.media_url,
        media_type: rawPost.media_type as 'image' | 'video' | 'audio' | null,
        visibility: uiVisibility as 'public' | 'friends' | 'incognito',
        created_at: rawPost.created_at,
        updated_at: rawPost.updated_at,
        shared_from: null,
        // Para publicaciones incógnito, siempre aseguramos que el perfil sea anónimo
        profiles: isIncognito ? {
          username: 'Anónimo',
          avatar_url: null
        } : profileData,
        poll: transformPoll(rawPost.poll),
        reactions: { count: 0, by_type: {} },
        reactions_count: 0,
        comments_count: 0
      };

      return post;
    } catch (err) {
      console.error("Error in post creation:", err);
      throw err;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}
