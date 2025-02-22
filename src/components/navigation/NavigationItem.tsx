
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { NavigationLink } from "./types";

export function NavigationItem({ link, isActive }: { link: NavigationLink; isActive: boolean }) {
  const Icon = link.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <Link
      to={link.to || '#'}
      onClick={handleClick}
      className={`p-4 transition-colors hover:text-primary relative ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="w-6 h-6" />
      {link.badge && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
        >
          {link.badge}
        </Badge>
      )}
    </Link>
  );
}
