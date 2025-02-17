
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Play, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

const dummyPosts = [
  {
    id: 1,
    author: "Ana García",
    avatar: "/placeholder.svg",
    content: "¡Increíble día en la playa!",
    likes: 24,
    comments: 5,
    hasAudio: true,
  },
  {
    id: 2,
    author: "Carlos Ruiz",
    avatar: "/placeholder.svg",
    content: "Compartiendo ideas sobre el nuevo proyecto",
    likes: 15,
    comments: 3,
    hasAudio: false,
  },
];

export function Feed() {
  return (
    <div className="space-y-4">
      {dummyPosts.map((post) => (
        <Card key={post.id} className="p-4 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={post.avatar} />
              <AvatarFallback>{post.author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{post.author}</h3>
              <p className="text-sm text-muted-foreground">Hace 2 horas</p>
            </div>
          </div>
          <p className="mb-4">{post.content}</p>
          {post.hasAudio && (
            <div className="bg-secondary rounded-lg p-3 mb-4 flex items-center gap-3">
              <Button variant="secondary" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <div className="h-8 flex-1 bg-primary/10 rounded-full" />
            </div>
          )}
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
