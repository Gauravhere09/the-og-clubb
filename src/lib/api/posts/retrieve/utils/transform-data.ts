
import { Post } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchPostsReactions, 
  fetchPostsComments, 
  fetchUserReactions,
  fetchUserPollVotes,
  fetchSharedPosts
} from "../../queries";
import { 
  processReactionsData, 
  processCommentsData, 
  updatePollsWithUserVotes,
  transformPostsData as transformPostsToObjects
} from "../../utils/transform-utils";

/**
 * Transforms raw posts data into Post objects with all needed data
 */
export async function transformPostsData(
  rawPosts: any[], 
  hasSharedFromColumn: boolean
): Promise<Post[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Initialize an empty shared posts map - we know shared posts don't exist
    const sharedPostsMap: Record<string, any> = {};

    // Get reactions and comments data
    const postIds = rawPosts.map(p => p.id);
    const { reactionsMap, commentsCountMap } = await getPostsMetadata(postIds);

    // Get user-specific data if logged in
    const { userReactionsMap, votesMap } = await getUserData(user, rawPosts, postIds);

    // Update poll data with user votes
    updatePollsWithUserVotes(rawPosts, votesMap);

    // Para publicaciones incógnito, reemplazar información del perfil
    const processedPosts = rawPosts.map(post => {
      if (post.visibility === 'private') {  // 'private' en BD = 'incognito' en UI
        return {
          ...post,
          visibility: 'incognito',  // Convertimos a formato UI
          profiles: {
            username: 'Anónimo',
            avatar_url: null
          }
        };
      }
      return post;
    });

    // Transform posts data using the shared utility
    return transformPostsToObjects(processedPosts, reactionsMap, commentsCountMap, userReactionsMap);
  } catch (error) {
    console.error('Error transforming posts data:', error);
    throw error;
  }
}

/**
 * Get reactions and comments data for posts
 */
async function getPostsMetadata(postIds: string[]) {
  // Get reactions data
  const reactionsData = await fetchPostsReactions(postIds);
  const reactionsMap = processReactionsData(reactionsData);

  // Get comments count
  const commentsData = await fetchPostsComments(postIds);
  const commentsCountMap = processCommentsData(commentsData);
  
  return { reactionsMap, commentsCountMap };
}

/**
 * Get user-specific data (reactions and poll votes)
 */
async function getUserData(user: any, rawPosts: any[], postIds: string[]) {
  let userReactionsMap: Record<string, string> = {};
  let votesMap: Record<string, string> = {};
  
  if (user) {
    userReactionsMap = await fetchUserReactions(user.id, postIds);

    // Get user's poll votes if any posts have polls
    if (rawPosts.some(post => post && post.poll)) {
      votesMap = await fetchUserPollVotes(user.id);
    }
  }
  
  return { userReactionsMap, votesMap };
}
