
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { transformPoll } from "./utils";
import { 
  fetchPostsReactions, 
  fetchPostsComments, 
  fetchUserReactions,
  fetchUserPollVotes,
  fetchSharedPosts
} from "./queries";

export async function getPosts(userId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if shared_from column exists
    const { error: columnCheckError } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1)
      .maybeSingle();
    
    // Determine the columns to select based on column existence
    const columnsToSelect = columnCheckError ? `
      id,
      content,
      user_id,
      media_url,
      media_type,
      visibility,
      poll,
      created_at,
      updated_at,
      profiles (
        username,
        avatar_url
      )
    ` : `
      id,
      content,
      user_id,
      media_url,
      media_type,
      visibility,
      poll,
      created_at,
      updated_at,
      shared_from,
      profiles (
        username,
        avatar_url
      )
    `;

    const query = supabase
      .from('posts')
      .select(columnsToSelect);

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data: rawPosts, error: postsError } = await query
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!rawPosts) return [];

    // Collect IDs of shared posts to fetch their details
    // Only proceed if shared_from column exists
    let sharedPostIds: string[] = [];
    let sharedPostsMap = {};
    
    if (!columnCheckError) {
      sharedPostIds = rawPosts
        .filter(post => 'shared_from' in post && post.shared_from)
        .map(post => post.shared_from!)
        .filter(Boolean) as string[];

      // Get shared posts data if there are any
      if (sharedPostIds.length) {
        sharedPostsMap = await fetchSharedPosts(sharedPostIds);
      }
    }
    
    // Get reactions data
    const reactionsData = await fetchPostsReactions(rawPosts.map(p => p.id));

    // Get comments count
    const commentsData = await fetchPostsComments(rawPosts.map(p => p.id));

    // Get user reactions if logged in
    let userReactionsMap: Record<string, string> = {};
    let votesMap: Record<string, string> = {};
    
    if (user) {
      userReactionsMap = await fetchUserReactions(user.id, rawPosts.map(p => p.id));

      // Get user's poll votes
      if (rawPosts.some(post => 'poll' in post && post.poll)) {
        votesMap = await fetchUserPollVotes(user.id);
        
        // Update poll data with user votes
        rawPosts.forEach(post => {
          if ('poll' in post && post.poll && typeof post.poll === 'object') {
            // Safely update the poll object with typechecking
            const pollObj = post.poll as Record<string, any>;
            pollObj.user_vote = votesMap[post.id] || null;
          }
        });
      }
    }

    // Process reactions data
    const reactionsMap = reactionsData.reduce((acc, reaction) => {
      if (!acc[reaction.post_id]) {
        acc[reaction.post_id] = { count: 0, by_type: {} };
      }
      acc[reaction.post_id].count++;
      acc[reaction.post_id].by_type[reaction.reaction_type] = 
        (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, { count: number; by_type: Record<string, number> }>);

    // Count comments
    const commentsCountMap = commentsData.reduce((acc, comment) => {
      acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transform posts data
    return rawPosts.map((post): Post => {
      // If this post is sharing another post, include the shared post details
      // Only if shared_from exists in the database
      const sharedPost = !columnCheckError && 'shared_from' in post && post.shared_from && 
                         sharedPostsMap[post.shared_from as string] 
        ? {
            id: sharedPostsMap[post.shared_from as string].id,
            content: sharedPostsMap[post.shared_from as string].content || '',
            user_id: sharedPostsMap[post.shared_from as string].user_id,
            media_url: sharedPostsMap[post.shared_from as string].media_url,
            media_type: sharedPostsMap[post.shared_from as string].media_type,
            visibility: sharedPostsMap[post.shared_from as string].visibility,
            created_at: sharedPostsMap[post.shared_from as string].created_at,
            updated_at: sharedPostsMap[post.shared_from as string].updated_at,
            profiles: sharedPostsMap[post.shared_from as string].profiles,
            poll: transformPoll(sharedPostsMap[post.shared_from as string].poll),
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
        shared_from: !columnCheckError && 'shared_from' in post ? post.shared_from : null,
        shared_post: sharedPost,
        user_reaction: userReactionsMap[post.id] as Post['user_reaction'],
        reactions: reactionsMap[post.id] || { count: 0, by_type: {} },
        reactions_count: reactionsMap[post.id]?.count || 0,
        comments_count: commentsCountMap[post.id] || 0
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
