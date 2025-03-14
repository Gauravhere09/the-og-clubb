
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/components/Post";
import { getPosts, getHiddenPosts } from "@/lib/api";
import type { Post as PostType, Poll } from "@/types/post";
import { Card } from "./ui/card";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PeopleYouMayKnow } from "@/components/friends/PeopleYouMayKnow";

interface FeedProps {
  userId?: string;
}

function transformPoll(pollData: any): Poll | null {
  if (!pollData) return null;
  return {
    question: pollData.question,
    options: (pollData.options || []).map((opt: any) => ({
      id: opt.id,
      content: opt.content,
      votes: Number(opt.votes)
    })),
    total_votes: Number(pollData.total_votes),
    user_vote: pollData.user_vote
  };
}

export function Feed({ userId }: FeedProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Obtener las publicaciones ocultas
  const { data: hiddenPosts = [] } = useQuery({
    queryKey: ["hidden-posts"],
    queryFn: getHiddenPosts,
  });

  // Actualizar hiddenPostIds cuando cambian los datos de hiddenPosts
  useEffect(() => {
    if (hiddenPosts && hiddenPosts.length > 0) {
      setHiddenPostIds(hiddenPosts);
    }
  }, [hiddenPosts]);

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getPosts(userId),
    select: (data) => {
      let transformedPosts = data.map(post => ({
        ...post,
        poll: transformPoll(post.poll)
      }));

      // Siempre ordenar por fecha más reciente
      transformedPosts = transformedPosts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (showNew) {
        // Si se solicita mostrar solo publicaciones nuevas, filtramos por las últimas 24 horas
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        transformedPosts = transformedPosts
          .filter(post => {
            const postDate = new Date(post.created_at);
            return postDate > twentyFourHoursAgo;
          });
      }

      return transformedPosts;
    }
  });

  // Cuando se detecta el parámetro 'new', recargar los posts y luego limpiar el parámetro
  useEffect(() => {
    if (showNew) {
      refetch().then(() => {
        // Limpiar el parámetro de la URL después de cargar
        setSearchParams({});
      });
    }
  }, [showNew, refetch, setSearchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </Card>
      </div>
    );
  }

  // Filtrar posts ocultos si no se está mostrando el modo "mostrar ocultos"
  const visiblePosts = showHidden 
    ? posts 
    : posts.filter(post => !hiddenPostIds.includes(post.id));
  
  // Publicaciones que están ocultas
  const onlyHiddenPosts = posts.filter(post => hiddenPostIds.includes(post.id));

  if (!visiblePosts.length && !onlyHiddenPosts.length) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">
          No hay publicaciones para mostrar
        </p>
      </Card>
    );
  }

  // Dividir los posts para insertar el componente "PeopleYouMayKnow"
  // después de las primeras 3 publicaciones (o menos si hay menos posts)
  const renderFeedContent = () => {
    const feedContent = [];
    let visiblePostsCopy = [...visiblePosts];
    
    // Insertar publicaciones ocultas si están visibles
    if (showHidden && onlyHiddenPosts.length > 0) {
      feedContent.push(
        <div key="hidden-posts-toggle" className="flex justify-center mb-2">
          <button 
            onClick={() => setShowHidden(!showHidden)}
            className="text-sm text-primary hover:underline"
          >
            {showHidden ? "Ocultar publicaciones filtradas" : `Mostrar ${onlyHiddenPosts.length} publicaciones ocultas`}
          </button>
        </div>
      );
      
      onlyHiddenPosts.forEach(post => {
        feedContent.push(
          <div key={post.id} className="relative mb-4">
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-10 z-0 pointer-events-none"></div>
            <Post key={post.id} post={post} isHidden={true} />
          </div>
        );
      });
    }
    
    // Primeras publicaciones (3 o menos)
    const firstBatch = visiblePostsCopy.slice(0, 3);
    firstBatch.forEach(post => {
      feedContent.push(
        <div key={post.id} className="mb-4">
          <Post post={post} />
        </div>
      );
    });
    
    // Insertar componente de sugerencias de amigos
    // Solo mostrar si hay posts visibles
    if (visiblePostsCopy.length > 0) {
      feedContent.push(
        <PeopleYouMayKnow key="people-you-may-know" />
      );
    }
    
    // Resto de publicaciones
    const remainingPosts = visiblePostsCopy.slice(3);
    remainingPosts.forEach(post => {
      feedContent.push(
        <div key={post.id} className="mb-4">
          <Post post={post} />
        </div>
      );
    });
    
    return feedContent;
  };

  return (
    <div className="space-y-0">
      {/* Botón para alternar la visualización de publicaciones ocultas */}
      {onlyHiddenPosts.length > 0 && !showHidden && (
        <div className="flex justify-center mb-2">
          <button 
            onClick={() => setShowHidden(!showHidden)}
            className="text-sm text-primary hover:underline"
          >
            {`Mostrar ${onlyHiddenPosts.length} publicaciones ocultas`}
          </button>
        </div>
      )}
      
      {renderFeedContent()}
    </div>
  );
}
