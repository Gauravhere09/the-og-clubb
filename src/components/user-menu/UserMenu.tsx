
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MenuHeader } from "./MenuHeader";
import { MenuOptions } from "./MenuOptions";
import { useUserProfile } from "./hooks/useUserProfile";
import { UserProfileDropdown } from "./UserProfileDropdown";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { username, avatarUrl, userId, isLoading } = useUserProfile();
  const { toast } = useToast();

  const createProfileLink = () => {
    if (!userId) return "";
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/profile/${userId}`;
  };
  
  const copyProfileLink = () => {
    const link = createProfileLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Enlace copiado",
      description: "Enlace a tu perfil copiado al portapapeles"
    });
  };

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full sm:max-w-lg bg-white dark:bg-gray-900">
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Header */}
          <MenuHeader onClose={handleClose} />
          
          {/* User Profile Dropdown */}
          <UserProfileDropdown 
            username={username}
            avatarUrl={avatarUrl}
            userId={userId}
            isLoading={isLoading}
          />
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto py-2 bg-white dark:bg-gray-900">
            {/* Main Menu Options */}
            <MenuOptions 
              userId={userId} 
              onClose={handleClose} 
              onCopyProfileLink={copyProfileLink} 
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
