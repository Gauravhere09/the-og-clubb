
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Shield, 
  UserCog, 
  Lock, 
  Mail, 
  Phone, 
  LogOut,
  Moon,
  Sun,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

interface MenuOptionsProps {
  userId: string | null;
  onClose: () => void;
  onCopyProfileLink: () => void;
}

export function MenuOptions({ userId, onClose, onCopyProfileLink }: MenuOptionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not sign out",
      });
    } else {
      onClose();
      navigate("/auth");
      toast({
        title: "Signed out",
        description: "You have successfully signed out",
      });
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="grid gap-2 px-4 bg-white dark:bg-gray-900">
      {/* Create New Account */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/auth?tab=register")}
      >
        <UserPlus className="mr-3 h-5 w-5 text-green-500" />
        <span>Create new profile</span>
      </Button>
      
      {/* Invite Friends */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={onCopyProfileLink}
      >
        <Heart className="mr-3 h-5 w-5 text-red-500" />
        <span>Invite friends</span>
      </Button>
      
      {/* Story Privacy Settings */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/settings/privacy")}
      >
        <Shield className="mr-3 h-5 w-5 text-primary" />
        <span>Story privacy</span>
      </Button>

      {/* Account Data */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/settings/account")}
      >
        <UserCog className="mr-3 h-5 w-5 text-primary" />
        <span>Personal data</span>
      </Button>

      {/* Password and Security */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/settings/security")}
      >
        <Lock className="mr-3 h-5 w-5 text-purple-light" />
        <span>Password and security</span>
      </Button>

      {/* Email */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/settings/email")}
      >
        <Mail className="mr-3 h-5 w-5 text-blue-500" />
        <span>Change linked email</span>
      </Button>

      {/* Phone */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-gray-800 shadow"
        onClick={() => handleNavigate("/settings/phone")}
      >
        <Phone className="mr-3 h-5 w-5 text-green-500" />
        <span>Add phone number</span>
      </Button>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-800 shadow rounded-md mt-4">
        <div className="flex items-center">
          {theme === "dark" ? (
            <Moon className="mr-3 h-5 w-5 text-purple-light" />
          ) : (
            <Sun className="mr-3 h-5 w-5 text-amber-500" />
          )}
          <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
        </div>
        <Switch 
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
        />
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="justify-start h-14 mt-4 bg-white dark:bg-gray-800 shadow text-red-600"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Sign out</span>
      </Button>
    </div>
  );
}
