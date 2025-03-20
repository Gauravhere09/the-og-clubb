
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Solo buscar por nombre de usuario y bio (eliminar career de la búsqueda)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .or(`username.ilike.%${debouncedSearch}%,bio.ilike.%${debouncedSearch}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo realizar la búsqueda"
        });
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, toast]);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getFirstName = (username: string) => {
    return username?.split(' ')[0] || 'Usuario';
  };

  return (
    <div ref={searchRef} className={`relative ${isMobile ? 'w-auto max-w-[200px]' : 'max-w-[250px]'}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 rounded-full border-gray-200 dark:border-gray-700 shadow-sm"
        />
      </div>
      {searchResults.length > 0 && (
        <Card className="absolute w-full mt-1 p-2 z-50 shadow-lg">
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center p-2 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getFirstName(user.username || 'Usuario')}</div>
                    {user.bio && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {user.bio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {isSearching && searchQuery.length >= 2 && (
        <Card className="absolute w-full mt-1 p-4 z-50 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </Card>
      )}
    </div>
  );
}
