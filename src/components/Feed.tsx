
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api";
import { Post } from "@/components/Post";
import { Skeleton } from "@/components/ui/skeleton";

export function Feed() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 space-y-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar las publicaciones
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
