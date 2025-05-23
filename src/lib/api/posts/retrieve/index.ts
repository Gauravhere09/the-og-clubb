
import { Post } from "@/types/post";
import { 
  checkSharedFromColumn, 
  fetchRawPosts, 
  transformPostsData 
} from "./utils";

/**
 * Main function to get posts, optionally filtered by user ID
 */
export async function getPosts(userId?: string): Promise<Post[]> {
  try {
    // Check if shared_from column exists
    const hasSharedFromColumn = await checkSharedFromColumn();
    
    // Fetch raw posts data
    const rawPosts = await fetchRawPosts(userId, hasSharedFromColumn);
    
    // Transform raw posts into Post objects with all related data
    return await transformPostsData(rawPosts, hasSharedFromColumn);
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
