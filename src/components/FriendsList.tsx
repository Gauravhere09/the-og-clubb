
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      // Get the current user
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id;
      
      if (!currentUserId) {
        setLoading(false);
        return;
      }
      
      // First get all formal friend relationships
      let allFriends: Friend[] = [];
      
      const { data: formalFriends, error: formalFriendsError } = await supabase
        .from('friends')
        .select('friend_id, friend_username:profiles!friends_friend_id_fkey(username, avatar_url)')
        .eq('user_id', currentUserId);
        
      if (formalFriendsError) throw formalFriendsError;
      
      // Add friends from the formal friends list
      if (formalFriends) {
        formalFriends.forEach(friend => {
          if (friend.friend_id && friend.friend_username) {
            allFriends.push({
              id: friend.friend_id,
              username: friend.friend_username.username || 'Usuario',
              avatar_url: friend.friend_username.avatar_url
            });
          }
        });
      }
      
      // Then get all message conversations the user has participated in
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
        
      if (messagesError) throw messagesError;
      
      // Extract unique user IDs from conversations
      const uniqueUserIds = new Set<string>();
      messagesData?.forEach(msg => {
        const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        uniqueUserIds.add(otherUserId);
      });
      
      // Get profiles for conversation partners who aren't formal friends
      if (uniqueUserIds.size > 0) {
        const userIdsToQuery = Array.from(uniqueUserIds).filter(
          id => !allFriends.some(friend => friend.id === id)
        );
        
        if (userIdsToQuery.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIdsToQuery);
            
          if (profilesError) throw profilesError;
          
          if (profilesData) {
            profilesData.forEach(profile => {
              if (!allFriends.some(f => f.id === profile.id)) {
                allFriends.push({
                  id: profile.id,
                  username: profile.username || 'Usuario',
                  avatar_url: profile.avatar_url
                });
              }
            });
          }
        }
      }
      
      setFriends(allFriends);
    } catch (error: any) {
      console.error("Error loading friends:", error);
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
    return <div>Cargando amigos...</div>;
  }

  if (friends.length === 0) {
    return <div className="text-muted-foreground">No tienes amigos agregados aún.</div>;
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={friend.avatar_url || undefined} />
              <AvatarFallback>{friend.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{friend.username}</div>
            </div>
          </div>
          <Link to={`/messages?user=${friend.id}`}>
            <Button variant="ghost" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
