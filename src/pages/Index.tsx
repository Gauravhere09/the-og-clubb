
import { Navigation } from "@/components/Navigation";
import { PostCreator } from "@/components/PostCreator";
import { Feed } from "@/components/feed/Feed";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { FriendSearch } from "@/components/FriendSearch";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

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
        <div className="max-w-screen-xl mx-auto px-2 py-2 md:px-4 md:py-8 md:flex">
          <main className="w-full">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 -mx-2 md:mx-0 px-2 md:px-0 pt-2">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="flex items-center gap-2">
                  {isMobile ? (
                    <Link to="/" className="relative w-8 h-8 bg-primary rounded-xl flex items-center justify-center transform transition-transform shadow-md">
                      <span className="text-xl font-bold text-primary-foreground">H</span>
                      <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
                    </Link>
                  ) : (
                    <h1 className="text-lg md:text-2xl font-semibold">Feed</h1>
                  )}
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <FriendSearch />
                  <NotificationDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <Menu className="h-4 w-4" />
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
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <PostCreator />
              
              {currentUserId && (
                <Card className="overflow-hidden">
                  <StoryViewer currentUserId={currentUserId} />
                </Card>
              )}
              
              <Feed />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Index;
