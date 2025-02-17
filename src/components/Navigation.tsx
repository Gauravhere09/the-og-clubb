
import { Bell, Home, Mail, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/messages", icon: Mail, label: "Mensajes" },
    { to: "/notifications", icon: Bell, label: "Notificaciones" },
    { to: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <div className="flex justify-around md:flex-col md:h-full md:justify-start md:pt-6 md:gap-8">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`p-4 transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
