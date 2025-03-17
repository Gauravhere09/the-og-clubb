
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
    // 1. Upload the image to storage
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
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    toast({
      variant: "destructive",
      title: "Error",
      description: "Una imagen es demasiado grande. Máximo 10MB.",
    });
    return false;
  }

  if (!file.type.startsWith("image/")) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Solo se permiten imágenes para las historias.",
    });
    return false;
  }

  return true;
}
