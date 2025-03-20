
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define StoryVisibility type properly with string literal union
export type StoryVisibility = 'public' | 'friends' | 'select' | 'except';

/**
 * Uploads a story to Supabase
 */
export async function uploadStory(
  file: File, 
  userId: string, 
  visibility: StoryVisibility
): Promise<string | null> {
  try {
    // Determine media type
    const isVideo = file.type.startsWith('video/');
    
    // 1. Upload the file to storage
    const fileName = `stories/${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('media')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;
    
    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);
      
    // 3. Create a story entry
    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const { error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        image_url: publicUrl,
        expires_at: expiresAt.toISOString(),
        media_type: isVideo ? 'video' : 'image',
        visibility: visibility
      });
      
    if (storyError) throw storyError;
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading story:", error);
    return null;
  }
}

/**
 * Validates a story file
 */
export function validateStoryFile(file: File): boolean {
  const fileSize = 15 * 1024 * 1024; // 15MB limit
  
  if (file.size > fileSize) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "El archivo es demasiado grande. Máximo 15MB.",
    });
    return false;
  }

  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Solo se permiten imágenes y videos para las historias.",
    });
    return false;
  }

  // Additional video validation
  if (file.type.startsWith("video/")) {
    // Max video duration would require client-side check with video element
    // For now, just check file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedVideoTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Formato de video no soportado. Utiliza MP4, WebM u OGG.",
      });
      return false;
    }
  }

  return true;
}

/**
 * Elimina las historias expiradas
 */
export async function cleanupExpiredStories(): Promise<number> {
  try {
    const now = new Date().toISOString();
    
    // Delete expired stories
    const { error, data } = await supabase
      .from('stories')
      .delete()
      .lt('expires_at', now)
      .select();
      
    if (error) throw error;
    
    // Return count
    if (data && Array.isArray(data)) {
      return data.length;
    }
    return 0;
  } catch (error) {
    console.error("Error cleaning up expired stories:", error);
    return 0;
  }
}

/**
 * Obtiene la configuración de privacidad de historias del usuario
 */
export async function getUserStoryPrivacySetting(userId: string): Promise<StoryVisibility> {
  try {
    // Create explicit RPC call to a stored procedure that handles this
    const { data, error } = await supabase
      .rpc('get_user_story_privacy', { 
        user_id_input: userId 
      } as { user_id_input: string });
      
    if (error) {
      console.error("Error obteniendo configuración de privacidad:", error);
      return 'public';
    }
    
    // Check if data is a valid StoryVisibility value
    if (typeof data === 'string' && 
        (data === 'public' || data === 'friends' || data === 'select' || data === 'except')) {
      return data as StoryVisibility;
    }
    
    // Default fallback
    return 'public';
  } catch (error) {
    console.error("Error obteniendo configuración de privacidad:", error);
    return 'public';
  }
}

/**
 * Guarda la configuración de privacidad de historias del usuario
 */
export async function saveUserStoryPrivacySetting(
  userId: string, 
  privacySetting: StoryVisibility
): Promise<boolean> {
  try {
    // Call RPC to create or update user settings
    const { error } = await supabase
      .rpc('save_user_story_privacy', { 
        user_id_input: userId,
        privacy_setting: privacySetting
      } as { user_id_input: string, privacy_setting: string });
      
    if (error) {
      console.error("Error guardando configuración de privacidad:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error guardando configuración de privacidad:", error);
    return false;
  }
}
