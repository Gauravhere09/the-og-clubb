
import { supabase } from "@/integrations/supabase/client";

/**
 * Función para limpiar la base de datos manteniendo solo un usuario específico
 * ¡ADVERTENCIA! Esta función eliminará permanentemente datos de la base de datos
 * @param keepUserId El ID del usuario que deseas conservar
 */
export async function cleanupDatabase(keepUserId: string) {
  try {
    // Verificar que el usuario existe
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', keepUserId)
      .single();
    
    if (userCheckError || !userExists) {
      throw new Error(`El usuario con ID ${keepUserId} no existe`);
    }

    // 1. Eliminar reacciones excepto las del usuario a conservar
    await supabase
      .from('reactions')
      .delete()
      .neq('user_id', keepUserId);
    
    // 2. Eliminar comentarios excepto los del usuario a conservar
    await supabase
      .from('comments')
      .delete()
      .neq('user_id', keepUserId);
    
    // 3. Eliminar posts excepto los del usuario a conservar
    await supabase
      .from('posts')
      .delete()
      .neq('user_id', keepUserId);
    
    // 4. Eliminar notificaciones relacionadas con otros usuarios
    await supabase
      .from('notifications')
      .delete()
      .or(`sender_id.neq.${keepUserId},receiver_id.neq.${keepUserId}`);
    
    // 5. Eliminar mensajes relacionados con otros usuarios
    await supabase
      .from('messages')
      .delete()
      .or(`sender_id.neq.${keepUserId},receiver_id.neq.${keepUserId}`);
    
    // 6. Eliminar amistades relacionadas con otros usuarios
    await supabase
      .from('friendships')
      .delete()
      .or(`user_id.neq.${keepUserId},friend_id.neq.${keepUserId}`);
    
    // 7. Eliminar perfiles excepto el del usuario a conservar
    await supabase
      .from('profiles')
      .delete()
      .neq('id', keepUserId);
    
    return { success: true, message: "Base de datos limpiada correctamente" };
  } catch (error) {
    console.error("Error al limpiar la base de datos:", error);
    return { 
      success: false, 
      message: "Error al limpiar la base de datos", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
