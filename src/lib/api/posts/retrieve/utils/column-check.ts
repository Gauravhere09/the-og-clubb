
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the 'shared_from' column exists in the 'posts' table
 */
export async function checkSharedFromColumn(): Promise<boolean> {
  try {
    // Try to select from the posts table with the shared_from column
    const { data, error } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1);
      
    if (error) {
      // Check if the error mentions "column does not exist"
      if (
        error.message && 
        (error.message.includes('column') && error.message.includes('does not exist'))
      ) {
        console.log('shared_from column does not exist in the posts table');
        return false;
      }
      // For other errors, log them and assume the column doesn't exist
      console.error('Error checking shared_from column:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking shared_from column:', error);
    return false;
  }
}
