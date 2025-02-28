
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the 'shared_from' column exists in the posts table
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1)
      .maybeSingle();
    
    // If we get a 42703 code (column does not exist), return false
    if (error && error.code === '42703') {
      return false;
    }
    
    // If there's no error, the column exists
    // If there's an error but it's not 42703, we assume the column might exist
    return !error;
  } catch (error) {
    console.error('Error checking shared_from column:', error);
    return false;
  }
}
