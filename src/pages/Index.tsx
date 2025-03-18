
import { Navigation } from "@/components/Navigation";
import { PostCreator } from "@/components/PostCreator";
import { Feed } from "@/components/feed/Feed";
import { StoryBanner } from "@/components/stories/StoryBanner";
import { Home, Menu, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { FriendSearch } from "@/components/FriendSearch";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { AdComponent } from "@/components/ads/AdComponent";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessageNotifications } from "@/components/messages/MessageNotification";

const Index = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [hasNewPosts, setHasNewPosts] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    loadCurrentUser();
  }, []);

  // Configurar notificaciones de mensajes en tiempo real
  useMessageNotifications(currentUserId);

  // Suscribirse a actualizaciones en tiempo real para nuevas publicaciones
  useEffect(() => {
    if (!currentUserId) return;
    
    const postsChannel = supabase
      .channel('new-posts-notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          // Solo mostrar notificación si no es una publicación propia
          if (payload.new && payload.new.user_id !== currentUserId) {
            setHasNewPosts(true);
            
            // Mostrar notificación toast
            toast({
              title: "Nueva publicación",
              description: "Hay nuevas publicaciones disponibles",
              duration: 4000,
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [currentUserId, toast]);

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
  
  const refreshFeed = () => {
    setHasNewPosts(false);
    window.scrollTo(0, 0);
    // La lógica de recargar el feed está implementada internamente en el componente Feed
    // Aquí solo reseteamos el indicador y hacemos scroll hacia arriba
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="fixed bottom-0 left-0 right-0 md:static md:left-0 z-10 fixed-bottom-nav">
        <Navigation />
      </div>
      
      <div className="flex-1 w-full md:ml-[70px] pb-16 md:pb-0 content-with-bottom-nav">
        <div className="max-w-screen-xl mx-auto px-2 py-2 md:px-4 md:py-8 md:flex">
          <main className={`w-full ${!isMobile ? "md:w-2/3 md:pr-4" : ""}`}>
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-2 -mx-2 md:mx-0 px-2 md:px-0 pt-2">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <h1 className="text-lg md:text-2xl font-semibold">Feed</h1>
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
                <StoryBanner currentUserId={currentUserId} />
              )}
              
              {hasNewPosts && (
                <Button 
                  variant="outline" 
                  className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 font-medium shadow-sm"
                  onClick={refreshFeed}
                >
                  Ver nuevas publicaciones
                </Button>
              )}
              
              <Feed />
            </div>
          </main>
          
          {!isMobile && (
            <aside className="hidden md:block md:w-1/3 md:pl-4 space-y-4">
              <div className="sticky top-20">
                <AdComponent format="sidebar" className="mb-4" />
                <Card className="p-4 mb-4">
                  <h3 className="font-medium mb-2">Publicidad</h3>
                  <p className="text-sm text-muted-foreground">
                    Anuncios personalizados basados en tus intereses
                  </p>
                </Card>
                <AdComponent format="sidebar" />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default Index;
