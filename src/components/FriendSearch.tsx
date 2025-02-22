
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FriendRequestButton } from "./FriendRequestButton";

export function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .or(`username.ilike.%${query}%, email.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error('Error searching users:', error);
      return;
    }

    setSearchResults(data || []);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Card className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios por nombre o correo..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {searchResults.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => handleUserClick(user.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.username}</div>
                  {user.email && (
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  )}
                </div>
              </div>
              <FriendRequestButton targetUserId={user.id} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
