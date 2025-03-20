
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  ArrowLeft, 
  ChevronDown, 
  Heart, 
  Link, 
  LogOut, 
  Mail, 
  Menu, 
  Phone, 
  Search, 
  Shield, 
  User,
  UserCog
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setUsername(profileData.username || 'Usuario');
          setAvatarUrl(profileData.avatar_url);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar sesión",
      });
    } else {
      setOpen(false);
      navigate("/auth");
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

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
      <SheetContent side="left" className="p-0 w-full sm:max-w-lg">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-4 border-b">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">Menú</h2>
            </div>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Profile Section */}
            <div className="bg-white dark:bg-card m-4 rounded-lg shadow">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>
                      {username ? username[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{username}</h3>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </div>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-start rounded-none py-5 px-4 text-muted-foreground gap-3"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span>Ver tu perfil</span>
                </div>
              </Button>
            </div>

            {/* Main Menu Options */}
            <div className="grid gap-2 px-4">
              {/* Invite Friends */}
              <Button
                variant="outline"
                className="justify-start h-14 bg-white dark:bg-card shadow"
                onClick={copyProfileLink}
              >
                <Heart className="mr-3 h-5 w-5 text-red-500" />
                <span>Invitar a amigos</span>
              </Button>
              
              {/* Story Privacy Settings */}
              <Button
                variant="outline"
                className="justify-start h-14 bg-white dark:bg-card shadow"
                onClick={() => navigate("/settings/privacy")}
              >
                <Shield className="mr-3 h-5 w-5 text-primary" />
                <span>Privacidad de historias</span>
              </Button>

              {/* Account Data */}
              <Button
                variant="outline"
                className="justify-start h-14 bg-white dark:bg-card shadow"
                onClick={() => navigate("/settings/account")}
              >
                <UserCog className="mr-3 h-5 w-5 text-primary" />
                <span>Datos personales</span>
              </Button>

              {/* Email */}
              <Button
                variant="outline"
                className="justify-start h-14 bg-white dark:bg-card shadow"
                onClick={() => navigate("/settings/email")}
              >
                <Mail className="mr-3 h-5 w-5 text-blue-500" />
                <span>Modificar correo vinculado</span>
              </Button>

              {/* Phone */}
              <Button
                variant="outline"
                className="justify-start h-14 bg-white dark:bg-card shadow"
                onClick={() => navigate("/settings/phone")}
              >
                <Phone className="mr-3 h-5 w-5 text-green-500" />
                <span>Agregar número de teléfono</span>
              </Button>

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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
