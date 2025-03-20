
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
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { AccountSwitcher } from "./AccountSwitcher";

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
        description: "No se pudo cerrar sesión",
      });
    } else {
      onClose();
      navigate("/auth");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
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
    <div className="grid gap-2 px-4">
      {/* Account Switcher */}
      <div className="bg-white dark:bg-card shadow rounded-md mb-2">
        <AccountSwitcher currentUserId={userId} />
      </div>
      
      {/* Create New Account */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/auth?tab=register")}
      >
        <UserPlus className="mr-3 h-5 w-5 text-green-500" />
        <span>Crear nuevo perfil</span>
      </Button>
      
      {/* Invite Friends */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={onCopyProfileLink}
      >
        <Heart className="mr-3 h-5 w-5 text-red-500" />
        <span>Invitar a amigos</span>
      </Button>
      
      {/* Story Privacy Settings */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/settings/privacy")}
      >
        <Shield className="mr-3 h-5 w-5 text-primary" />
        <span>Privacidad de historias</span>
      </Button>

      {/* Account Data */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/settings/account")}
      >
        <UserCog className="mr-3 h-5 w-5 text-primary" />
        <span>Datos personales</span>
      </Button>

      {/* Password and Security */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/settings/security")}
      >
        <Lock className="mr-3 h-5 w-5 text-purple-light" />
        <span>Contraseña y seguridad</span>
      </Button>

      {/* Email */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/settings/email")}
      >
        <Mail className="mr-3 h-5 w-5 text-blue-500" />
        <span>Modificar correo vinculado</span>
      </Button>

      {/* Phone */}
      <Button
        variant="outline"
        className="justify-start h-14 bg-white dark:bg-card shadow"
        onClick={() => handleNavigate("/settings/phone")}
      >
        <Phone className="mr-3 h-5 w-5 text-green-500" />
        <span>Agregar número de teléfono</span>
      </Button>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between h-14 px-4 bg-white dark:bg-card shadow rounded-md mt-4">
        <div className="flex items-center">
          {theme === "dark" ? (
            <Moon className="mr-3 h-5 w-5 text-purple-light" />
          ) : (
            <Sun className="mr-3 h-5 w-5 text-amber-500" />
          )}
          <span>{theme === "dark" ? "Modo oscuro" : "Modo claro"}</span>
        </div>
        <Switch 
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
        />
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="justify-start h-14 mt-4 bg-white dark:bg-card shadow text-red-600"
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Cerrar sesión</span>
      </Button>
    </div>
  );
}
