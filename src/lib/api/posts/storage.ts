
import { supabase } from "@/integrations/supabase/client";

export async function uploadMediaFile(file: File): Promise<string | null> {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return publicUrl;
}

export function getMediaType(file: File): 'image' | 'video' | 'audio' | null {
  if (!file) return null;
  
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  
  return null;
}
