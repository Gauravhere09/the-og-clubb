
import { Post } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchPostsReactions, 
  fetchPostsComments, 
  fetchUserReactions,
  fetchUserPollVotes,
  fetchSharedPosts
} from "../../queries";
import { transformPoll } from "../../utils";
import { processReactionsData, processCommentsData } from "./process-reactions";

/**
 * Transforms raw posts data into Post objects with all needed data
 */
export async function transformPostsData(
  rawPosts: any[], 
  hasSharedFromColumn: boolean
): Promise<Post[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Initialize an empty shared posts map
    let sharedPostsMap: Record<string, any> = {};
    
    // Only attempt to fetch shared posts if the column exists
    if (hasSharedFromColumn) {
      // Collect IDs of shared posts to fetch their details
      const sharedPostIds = rawPosts
        .filter(post => post && typeof post === 'object' && post.shared_from)
        .map(post => post.shared_from)
        .filter(Boolean) as string[];
        
      // Get shared posts data if there are any
      if (sharedPostIds.length) {
        sharedPostsMap = await fetchSharedPosts(sharedPostIds);
      }
    }

    // Get reactions and comments data
    const postIds = rawPosts.map(p => p.id);
    const { reactionsMap, commentsCountMap } = await getPostsMetadata(postIds);

    // Get user-specific data if logged in
    const { userReactionsMap, votesMap } = await getUserData(user, rawPosts, postIds);

    // Update poll data with user votes
    updatePollsWithUserVotes(rawPosts, votesMap);

    // Transform posts data
    return rawPosts.map((post): Post => {
      if (!post) return {} as Post;

      // Process shared posts from legacy shared_from if applicable
      const legacySharedPost = hasSharedFromColumn && post.shared_from && sharedPostsMap[post.shared_from]
        ? {
            id: sharedPostsMap[post.shared_from].id,
            content: sharedPostsMap[post.shared_from].content || '',
            user_id: sharedPostsMap[post.shared_from].user_id,
            media_url: sharedPostsMap[post.shared_from].media_url,
            media_type: sharedPostsMap[post.shared_from].media_type,
            visibility: sharedPostsMap[post.shared_from].visibility,
            created_at: sharedPostsMap[post.shared_from].created_at,
            updated_at: sharedPostsMap[post.shared_from].updated_at,
            profiles: sharedPostsMap[post.shared_from].profiles,
            poll: transformPoll(sharedPostsMap[post.shared_from].poll),
          } as Post
        : null;

      return {
        id: post.id,
        content: post.content || '',
        user_id: post.user_id,
        media_url: post.media_url,
        media_type: post.media_type as Post['media_type'],
        visibility: post.visibility as Post['visibility'],
        created_at: post.created_at,
        updated_at: post.updated_at,
        profiles: post.profiles,
        poll: transformPoll(post.poll),
        shared_from: hasSharedFromColumn ? post.shared_from : null,
        shared_post: post.shared_post || legacySharedPost,
        user_reaction: userReactionsMap[post.id] as Post['user_reaction'],
        reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
        reactions_count: reactionsMap[post.id]?.count || 0,
        comments_count: commentsCountMap[post.id] || 0
      };
    });
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

/**
 * Update polls with user votes
 */
function updatePollsWithUserVotes(rawPosts: any[], votesMap: Record<string, string>) {
  rawPosts.forEach(post => {
    if (!post) return;
    
    if (post.poll && typeof post.poll === 'object') {
      // Safely update the poll object with typechecking
      const pollObj = post.poll as Record<string, any>;
      pollObj.user_vote = votesMap[post.id] || null;
    }
  });
}
