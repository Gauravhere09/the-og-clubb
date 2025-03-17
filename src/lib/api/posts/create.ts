
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

    const insertData = {
      content,
      media_url,
      media_type,
      poll,
      user_id: user.id,
      visibility
    } as Tables['posts']['Insert'];

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

      // Transform the raw post to match Post type
      const post: Post = {
        id: rawPost.id,
        content: rawPost.content || '',
        user_id: rawPost.user_id,
        media_url: rawPost.media_url,
        media_type: rawPost.media_type as 'image' | 'video' | 'audio' | null,
        visibility: rawPost.visibility as 'public' | 'friends' | 'incognito',
        created_at: rawPost.created_at,
        updated_at: rawPost.updated_at,
        shared_from: null,
        profiles: visibility === 'incognito' ? {
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
