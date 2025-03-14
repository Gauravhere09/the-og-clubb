
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Feed } from "@/components/Feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  // Get friends data directly from Supabase
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends', profileId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            user:profiles!friendships_user_id_fkey(id, username, avatar_url)
          `)
          .eq('friend_id', profileId)
          .eq('status', 'accepted');

        if (error) throw error;
        
        // Return friends from user column
        return data?.map(item => ({
          friend_id: item.user.id,
          friend_username: item.user.username,
          friend_avatar_url: item.user.avatar_url
        })) || [];
      } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
      }
    }
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
