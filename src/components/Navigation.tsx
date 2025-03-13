
import { Home, MessageCircle, User, Heart, UserPlus } from "lucide-react";
import { Logo } from "./navigation/Logo";
import { NavigationItem } from "./navigation/NavigationItem";
import { useNavigation } from "./navigation/use-navigation";
import { useFriends } from "@/hooks/use-friends";
import type { NavigationLink } from "./navigation/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  
  const navigate = useNavigate();
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  
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

  const handleProfileClick = () => {
    // Solo registramos que se ha hecho clic, la navegación ocurrirá automáticamente
    if (currentUserId) {
      console.log("Navigating to profile:", currentUserId);
      // Forzamos la navegación programáticamente para asegurar que funcione
      navigate(`/profile/${currentUserId}`);
    }
  };

  const links: NavigationLink[] = [
    { 
      to: "/",
      icon: Home, 
      label: "Inicio",
      onClick: handleHomeClick,
      badge: newPosts > 0 ? newPosts : null 
    },
    { 
      to: "/messages", 
      icon: MessageCircle, 
      label: "Mensajes" 
    },
    {
      to: "/friends/requests",
      icon: UserPlus,
      label: "Solicitudes",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeVariant: "secondary"
    },
    {
      to: "/popularity",
      icon: Heart,
      label: "Popularidad"
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "/", 
      icon: User, 
      label: "Perfil",
      onClick: handleProfileClick
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
