
import { Bell, Home, Mail, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Logo = () => (
  <div className="hidden md:flex justify-center my-6">
    <Link to="/" className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform hover:scale-105">
      <span className="text-2xl font-bold text-primary-foreground">H</span>
      <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
    </Link>
  </div>
);

export function Navigation() {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/messages", icon: Mail, label: "Mensajes" },
    { to: "/friends", icon: Users, label: "Amigos" },
    { to: "/notifications", icon: Bell, label: "Notificaciones" },
    { to: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t md:relative md:border-t-0 md:border-r md:w-[70px] md:h-screen z-50">
      <Logo />
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
