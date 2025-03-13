
import { useState, useEffect } from "react";
import { getFriends } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Friend } from "@/types/friends";

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsData = await getFriends();
      setFriends(friendsData);
    } catch (error: any) {
      console.error("Error cargando amigos:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los amigos",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (friends.length === 0) {
    return <div className="text-muted-foreground">No tienes amigos agregados aún.</div>;
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div key={friend.friend_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={friend.friend_avatar_url || undefined} />
              <AvatarFallback>{friend.friend_username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{friend.friend_username}</div>
            </div>
          </div>
          <Link to={`/messages?user=${friend.friend_id}`}>
            <Button variant="ghost" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
