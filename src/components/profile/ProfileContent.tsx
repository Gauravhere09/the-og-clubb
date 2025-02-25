
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Feed } from "@/components/Feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFriends } from "@/lib/api/friends";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends', profileId],
    queryFn: () => getFriends()
  });

  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="feed">Publicaciones</TabsTrigger>
        <TabsTrigger value="friends">Amigos ({friends.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="feed">
        <Feed userId={profileId} />
      </TabsContent>
      <TabsContent value="friends">
        <Card className="p-4">
          {isLoadingFriends ? (
            <p className="text-center text-muted-foreground">Cargando amigos...</p>
          ) : friends.length === 0 ? (
            <p className="text-center text-muted-foreground">Esta persona aún no tiene amigos</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {friends.map((friend) => (
                  <Link
                    key={friend.friend_id}
                    to={`/profile/${friend.friend_id}`}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg"
                  >
                    <Avatar>
                      <AvatarImage src={friend.friend_avatar_url || undefined} />
                      <AvatarFallback>
                        {friend.friend_username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{friend.friend_username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
