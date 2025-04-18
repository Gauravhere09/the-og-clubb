
import { supabase } from "@/integrations/supabase/client";

export async function uploadProfileImage(file: File, type: 'avatar' | 'cover') {
  try {
    // Validar tamaño del archivo
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("El archivo no puede ser mayor a 2MB");
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error("Solo se permiten archivos de imagen");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // Crear nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Simplificamos el path

    // Subir el archivo directamente al bucket
    const { error: uploadError, data } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    // Actualizar perfil
    const updateData = type === 'avatar' 
      ? { avatar_url: publicUrl }
      : { cover_url: publicUrl };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
