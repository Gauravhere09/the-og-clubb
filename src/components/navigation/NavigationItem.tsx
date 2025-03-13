
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
      className={`flex items-center justify-center py-4 px-2 transition-colors relative ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon strokeWidth={1.5} className="w-6 h-6" />
      {link.badge && (
        <Badge 
          variant={link.badgeVariant || "destructive"} 
          className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs px-2 py-0"
        >
          {link.badge}
        </Badge>
      )}
    </Link>
  );
}
