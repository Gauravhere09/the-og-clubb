
import { Globe, Users, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post, Poll } from "@/types/post";
import { PollDisplay } from "./PollDisplay";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostContentProps {
  post: Post;
  postId: string;
}

export function PostContent({ post, postId }: PostContentProps) {
  const queryClient = useQueryClient();

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'friends':
        return <Users className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const handleVote = async (optionId: string) => {
    if (!post.poll) return;

    // Actualizar la UI optimistamente
    const oldPoll = post.poll;
    const newOptions = post.poll.options.map(opt => ({
      ...opt,
      votes: opt.id === optionId ? opt.votes + 1 : opt.votes
    }));

    queryClient.setQueryData(['posts'], (old: Post[] | undefined) => {
      if (!old) return old;
      return old.map((p) => {
        if (p.id === postId && p.poll) {
          return {
            ...p,
            poll: {
              ...p.poll,
              options: newOptions,
              total_votes: p.poll.total_votes + 1,
              user_vote: optionId
            }
          };
        }
        return p;
      });
    });

    try {
      // Actualizar el post en la base de datos
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para votar");

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('poll')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      const currentPoll = postData.poll as Poll;
      const updatedPoll = {
        ...currentPoll,
        options: currentPoll.options.map((opt) => ({
          ...opt,
          votes: opt.id === optionId ? opt.votes + 1 : opt.votes
        })),
        total_votes: currentPoll.total_votes + 1
      };

      const { error: updateError } = await supabase
        .from('posts')
        .update({ poll: updatedPoll })
        .eq('id', postId);

      if (updateError) throw updateError;

      // Invalidar la consulta para obtener los datos actualizados
      queryClient.invalidateQueries({ queryKey: ['posts'] });

    } catch (error) {
      console.error('Error al actualizar la votación:', error);
      // Revertir el cambio optimista en caso de error
      queryClient.setQueryData(['posts'], (old: Post[] | undefined) => {
        if (!old) return old;
        return old.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              poll: oldPoll
            };
          }
          return p;
        });
      });
    }
  };

  return (
    <>
      {post.content && (
        <div className="mb-4">
          <p>{post.content}</p>
          <div className="flex items-center gap-2 mt-1">
            {getVisibilityIcon(post.visibility)}
            <span className="text-xs text-muted-foreground capitalize">
              {post.visibility}
            </span>
          </div>
        </div>
      )}

      {post.poll && (
        <PollDisplay 
          poll={post.poll}
          postId={postId}
          onVote={handleVote}
        />
      )}

      {post.media_url && (
        <div className="mb-4">
          {post.media_type === 'image' && (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'video' && (
            <video
              src={post.media_url}
              controls
              className="w-full rounded-lg"
            />
          )}
          {post.media_type === 'audio' && (
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-3">
              <Button variant="secondary" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <audio src={post.media_url} controls className="w-full" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
