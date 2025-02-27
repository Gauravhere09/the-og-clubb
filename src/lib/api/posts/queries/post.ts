
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { transformPoll } from "../utils";

export async function fetchPostById(postId: string): Promise<Post | null> {
  try {
    // Check if shared_from column exists
    const { error: columnCheckError } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1)
      .maybeSingle();
    
    // If shared_from column doesn't exist, use a query without it
    const hasSharedFromColumn = !columnCheckError;
    
    let post = null;
    
    if (hasSharedFromColumn) {
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
          shared_from,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();
        
      if (error || !data) return null;
      post = data;
    } else {
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
      post = data;
    }

    // Ensure post exists before accessing its properties
    if (!post) return null;

    // Transform to Post type
    return {
      id: post.id,
      content: post.content ?? '',
      user_id: post.user_id,
      media_url: post.media_url,
      media_type: post.media_type as Post['media_type'],
      visibility: post.visibility as Post['visibility'],
      created_at: post.created_at,
      updated_at: post.updated_at,
      profiles: post.profiles,
      poll: transformPoll(post.poll),
      shared_from: hasSharedFromColumn ? post.shared_from : null,
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

export async function fetchSharedPosts(sharedPostIds: string[]): Promise<Record<string, any>> {
  if (!sharedPostIds.length) return {};
  
  try {
    // Check if shared_from column exists
    const { error: columnCheckError } = await supabase
      .from('posts')
      .select('shared_from')
      .limit(1)
      .maybeSingle();
    
    // If shared_from column doesn't exist, return empty object
    if (columnCheckError) {
      console.warn("shared_from column doesn't exist in posts table");
      return {};
    }
    
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
        shared_from,
        profiles (
          username,
          avatar_url
        )
      `)
      .in('id', sharedPostIds);
      
    if (error || !sharedPosts?.length) return {};
    
    return sharedPosts.reduce((acc, post) => {
      // Check if post is null before accessing its properties
      if (post && typeof post === 'object' && 'id' in post) {
        acc[post.id] = post;
      }
      return acc;
    }, {} as Record<string, any>);
  }
  catch (error) {
    console.error("Error fetching shared posts:", error);
    return {};
  }
}
