
import { Home, MessageCircle, User, Heart, UserPlus } from "lucide-react";
import { Logo } from "./navigation/Logo";
import { NavigationItem } from "./navigation/NavigationItem";
import { useNavigation } from "./navigation/use-navigation";
import { useFriends } from "@/hooks/use-friends";
import type { NavigationLink } from "./navigation/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const {
    currentUserId,
    unreadNotifications,
    newPosts,
    handleLogout,
    handleHomeClick,
    handleNotificationClick,
    location
  } = useNavigation();
  
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // Verificar estado de autenticación inicial
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (!currentUserId) return;
    
    // Get initial count of pending requests
    const loadPendingRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('friendships')
          .select('id')
          .eq('friend_id', currentUserId)
          .eq('status', 'pending');
          
        if (error) throw error;
        setPendingRequestsCount(data?.length || 0);
      } catch (error) {
        console.error('Error loading pending requests count:', error);
      }
    };
    
    loadPendingRequests();
    
    // Subscribe to changes in friendships table
    const friendshipsChannel = supabase
      .channel('friendships_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `friend_id=eq.${currentUserId}`,
      }, () => {
        loadPendingRequests();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(friendshipsChannel);
    };
  }, [currentUserId]);

  const links: NavigationLink[] = [
    { 
      to: "/",
      icon: Home, 
      label: "Inicio",
      hideLabel: true, // Hide label on mobile
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null 
    },
    { 
      to: "/messages", 
      icon: MessageCircle, 
      label: "Mensajes",
      hideLabel: true // Hide label on mobile
    },
    {
      to: "/friends/requests",
      icon: UserPlus,
      label: "Solicitudes",
      hideLabel: true, // Hide label on mobile
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeVariant: "secondary"
    },
    {
      to: "/popularity",
      icon: Heart,
      label: "Popularidad",
      hideLabel: true // Hide label on mobile
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "/auth", 
      icon: User, 
      label: "Perfil",
      hideLabel: true // Hide label on mobile
    }
  ];

  // Check if the current path starts with /profile to highlight the profile icon
  const isProfilePage = location.pathname.startsWith('/profile');
  // Check if we're on any of the friend request pages
  const isFriendRequestsPage = location.pathname.startsWith('/friends/requests');

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:fixed md:top-0 md:bottom-auto md:border-t-0 md:border-r md:w-[70px] md:min-h-screen md:h-screen z-50 flex flex-col">
      <Logo />
      <div className="flex justify-around md:grid md:grid-cols-1 w-full flex-1 md:pt-6">
        {links.map((link) => (
          <NavigationItem
            key={link.label}
            link={link}
            isActive={
              link.label === "Perfil" 
                ? isProfilePage 
                : link.label === "Solicitudes"
                  ? isFriendRequestsPage
                  : link.to === location.pathname
            }
          />
        ))}
      </div>
    </nav>
  );
}
