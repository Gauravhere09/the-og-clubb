
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type StoryVisibility = 'public' | 'friends' | 'select';

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
        media_type: isVideo ? 'video' : 'image'
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
