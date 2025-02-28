
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { transformPoll } from "../utils";

export async function fetchPostById(postId: string): Promise<Post | null> {
  try {
    // Direct query without checking for column existence first
    const { data, error } = await supabase
      .from('posts')
      .select(`
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
      `)
      .eq('id', postId)
      .single();
      
    if (error || !data) return null;

    // Transform to Post type
    return {
      id: data.id,
      content: data.content ?? '',
      user_id: data.user_id,
      media_url: data.media_url,
      media_type: data.media_type as Post['media_type'],
      visibility: data.visibility as Post['visibility'],
      created_at: data.created_at,
      updated_at: data.updated_at,
      profiles: data.profiles,
      poll: transformPoll(data.poll),
      shared_from: null, // Default to null since we're not querying this field
      shared_post: null,
      reactions: { count: 0, by_type: {} },
      reactions_count: 0,
      comments_count: 0
    };
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
}

// Define an interface for the post data structure we expect from Supabase
interface PostData {
  id: string;
  content?: string | null;
  user_id?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  visibility?: string | null;
  poll?: any;
  created_at?: string | null;
  updated_at?: string | null;
  profiles?: {
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export async function fetchSharedPosts(sharedPostIds: string[]): Promise<Record<string, any>> {
  if (!sharedPostIds.length) return {};
  
  try {
    const { data: sharedPosts, error } = await supabase
      .from('posts')
      .select(`
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
      `)
      .in('id', sharedPostIds);
      
    if (error || !sharedPosts) return {};
    
    // Create a map of post IDs to posts
    const postsMap: Record<string, any> = {};
    
    // Filter out any null items and ensure we have valid posts
    const validPosts = (sharedPosts as any[]).filter((post): post is PostData => {
      return post && typeof post === 'object' && 'id' in post && typeof post.id === 'string';
    });
    
    // Now we can safely process each post
    validPosts.forEach(post => {
      postsMap[post.id] = {
        id: post.id,
        content: post.content ?? '',
        user_id: post.user_id ?? null,
        media_url: post.media_url ?? null,
        media_type: post.media_type ?? null,
        visibility: post.visibility ?? 'public',
        poll: post.poll ?? null,
        created_at: post.created_at ?? new Date().toISOString(),
        updated_at: post.updated_at ?? new Date().toISOString(),
        shared_from: null, // Default to null since this column might not exist
        profiles: post.profiles ?? null
      };
    });
    
    return postsMap;
  }
  catch (error) {
    console.error("Error fetching shared posts:", error);
    return {};
  }
}
