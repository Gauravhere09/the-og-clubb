
import { Bell, Home, Mail, User, Users } from "lucide-react";
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
      onClick: handleHomeClick,
      icon: Home, 
      label: "Inicio",
      badge: newPosts > 0 ? newPosts : null 
    },
    { 
      to: "/messages", 
      icon: Mail, 
      label: "Mensajes" 
    },
    { 
      to: "/friends", 
      icon: Users, 
      label: "Amigos" 
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

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <Logo />
      <div className="flex justify-around md:flex-col md:h-full md:justify-start md:pt-6 md:gap-8">
        {links.map((link) => (
          <NavigationItem
            key={link.label}
            link={link}
            isActive={link.to ? location.pathname === link.to : location.pathname === '/'}
          />
        ))}
      </div>
    </nav>
  );
}
