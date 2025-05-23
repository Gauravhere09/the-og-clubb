
import { Navigation } from "@/components/Navigation";
import { PostCreator } from "@/components/PostCreator";
import { Feed } from "@/components/feed/Feed";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { UserMenu } from "@/components/user-menu/UserMenu";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { FriendSearch } from "@/components/FriendSearch";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Card } from "@/components/ui/card";
import { FriendsListSection } from "@/components/friends/FriendsListSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoryCleanup } from "@/hooks/use-story-cleanup";
import { useFriends } from "@/hooks/use-friends";

const Index = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useStoryCleanup();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  // Get friends list using the useFriends hook
  const { friends } = useFriends(currentUserId);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar sesión",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="fixed bottom-0 left-0 right-0 md:static md:left-0 z-10 fixed-bottom-nav">
        <Navigation />
      </div>
      
      <div className="flex-1 w-full md:ml-[70px] pb-16 md:pb-0 content-with-bottom-nav">
        <div className="max-w-[1200px] mx-auto">
          <main className="w-full flex flex-col md:flex-row">
            {/* Sidebar izquierdo - solo visible en desktop */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5 p-4">
              {/* Contenido del sidebar izquierdo */}
            </div>
            
            {/* Contenido central */}
            <div className="w-full md:w-2/4 lg:w-3/5 px-2 py-2 md:px-4 md:py-4">
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 -mx-2 md:mx-0 px-2 md:px-0 pt-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center">
                    {isMobile ? (
                      <Link to="/" className="relative w-8 h-8 bg-primary rounded-xl flex items-center justify-center transform transition-transform shadow-md mr-2">
                        <span className="text-xl font-bold text-primary-foreground">H</span>
                        <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
                      </Link>
                    ) : (
                      <h1 className="text-lg md:text-2xl font-semibold">Feed</h1>
                    )}
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                    <FriendSearch />
                  </div>
                  
                  <div className="flex items-center">
                    <NotificationDropdown />
                    <UserMenu />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full md:flex hidden"
                        >
                          {theme === "dark" ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                          {theme === "dark" ? (
                            <>
                              <Sun className="mr-2 h-4 w-4" />
                              <span>Modo claro</span>
                            </>
                          ) : (
                            <>
                              <Moon className="mr-2 h-4 w-4" />
                              <span>Modo oscuro</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 mx-auto">
                <PostCreator />
                
                {currentUserId && (
                  <Card className="overflow-hidden mb-4">
                    <StoryViewer currentUserId={currentUserId} />
                  </Card>
                )}
                
                <Feed />
              </div>
            </div>
            
            {/* Sidebar derecho - amigos list */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5 p-4">
              <Card className="sticky top-20 p-4">
                <h3 className="text-lg font-semibold mb-4">Amigos</h3>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {friends && friends.length > 0 ? (
                    friends.map(friend => (
                      <Link 
                        key={friend.id} 
                        to={`/profile/${friend.id}`}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <img 
                          src={friend.avatar_url || "/placeholder.svg"} 
                          alt={friend.username} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium truncate">{friend.username}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No tienes amigos aún</p>
                  )}
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Index;
