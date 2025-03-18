
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar publicaciones
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Construir la consulta base
      let query = supabase
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
          ),
          reactions:post_reactions (
            id,
            type,
            user_id
          ),
          comments:post_comments (
            id
          )
        `)
        .order('created_at', { ascending: false });

      // Si se proporciona userId, filtrar por ese usuario
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transformar los datos al formato requerido para Post[]
      const formattedPosts: Post[] = data.map((post: any) => {
        // Manejar posts incógnito para mostrarlos anónimamente
        const isIncognito = post.visibility === 'private';
        
        // Ensure media_type is one of the allowed values or null
        const mediaType = post.media_type ? 
          (post.media_type === 'image' || post.media_type === 'video' || post.media_type === 'audio' ? 
            post.media_type as 'image' | 'video' | 'audio' : null) : 
          null;
        
        return {
          id: post.id,
          content: post.content,
          user_id: post.user_id,
          media_url: post.media_url,
          media_type: mediaType,
          visibility: isIncognito ? 'incognito' : post.visibility,
          created_at: post.created_at,
          updated_at: post.updated_at,
          shared_from: null,
          // Para posts incógnito, mostrar usuario como 'Anónimo'
          profiles: isIncognito ? {
            username: 'Anónimo',
            avatar_url: null
          } : post.profiles,
          poll: post.poll,
          reactions: {
            count: Array.isArray(post.reactions) ? post.reactions.length : 0,
            by_type: Array.isArray(post.reactions) ? 
              post.reactions.reduce((acc: Record<string, number>, reaction: any) => {
                acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                return acc;
              }, {}) : 
              {}
          },
          reactions_count: Array.isArray(post.reactions) ? post.reactions.length : 0,
          comments_count: Array.isArray(post.comments) ? post.comments.length : 0
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar publicaciones al montar el componente
  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return { 
    posts, 
    isLoading,
    refetch: fetchPosts
  };
}
