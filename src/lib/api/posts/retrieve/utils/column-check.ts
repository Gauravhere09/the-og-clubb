
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the 'shared_from' column exists in the posts table
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  try {
    const { error: columnCheckError } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1)
      .maybeSingle();
    
    // If no error, the column exists
    return !columnCheckError;
  } catch (error) {
    console.error('Error checking shared_from column:', error);
    return false;
  }
}
