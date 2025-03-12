
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface NotificationDropdownHeaderProps {
  hasUnread: boolean;
  onMarkAllAsRead: () => void;
}

export function NotificationDropdownHeader({ 
  hasUnread, 
  onMarkAllAsRead 
}: NotificationDropdownHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
      <h4 className="font-semibold text-lg">Notificaciones</h4>
      <div className="flex gap-2">
        {hasUnread && (
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={onMarkAllAsRead}
          >
            <Check className="h-3.5 w-3.5" />
            <span>Marcar como leídas</span>
          </Button>
        )}
        <Link to="/notifications">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Ver todas
          </Button>
        </Link>
      </div>
    </div>
  );
}
