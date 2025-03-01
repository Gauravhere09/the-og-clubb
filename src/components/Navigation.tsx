
import { Bell, Home, MessageCircle, User, Heart } from "lucide-react";
import { Logo } from "./navigation/Logo";
import { NavigationItem } from "./navigation/NavigationItem";
import { useNavigation } from "./navigation/use-navigation";
import type { NavigationLink } from "./navigation/types";

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
      to: "/popularity",
      icon: Heart,
      label: "Popularidad"
    },
    { 
      to: "/notifications", 
      icon: Bell, 
      label: "Notificaciones",
      badge: unreadNotifications > 0 ? unreadNotifications : null,
      onClick: handleNotificationClick
    },
    { 
      to: currentUserId ? `/profile/${currentUserId}` : "/", 
      icon: User, 
      label: "Perfil" 
    }
  ];

  // Check if the current path starts with /profile to highlight the profile icon
  const isProfilePage = location.pathname.startsWith('/profile');

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <Logo />
      <div className="grid grid-cols-5 md:grid-cols-1 w-full md:h-[calc(100%-60px)] md:pt-6 relative">
        {links.map((link) => (
          <NavigationItem
            key={link.label}
            link={link}
            isActive={
              link.label === "Perfil" 
                ? isProfilePage 
                : link.to === location.pathname
            }
          />
        ))}
      </div>
    </nav>
  );
}
