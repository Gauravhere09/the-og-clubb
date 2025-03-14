
import { MessagesController } from "@/components/messages/MessagesController";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Messages = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    };
    
    checkAuth();
  }, []);
  
  if (isLoggedIn === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-medium">Inicia sesión para ver tus mensajes</h2>
          <p className="text-muted-foreground">Necesitas iniciar sesión para acceder a tus conversaciones</p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
          </Button>
        </Card>
      </div>
    );
  }
  
  return <MessagesController />;
};

export default Messages;
