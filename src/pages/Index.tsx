
import { Navigation } from "@/components/Navigation";
import { PostCreator } from "@/components/PostCreator";
import { Feed } from "@/components/Feed";
import { Home, Plus, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión"
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">Feed</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="search" 
                placeholder="Buscar..." 
                className="pl-10 pr-4 rounded-full bg-gray-100 border-0"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-100"
              onClick={handleLogout}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="space-y-6">
          <PostCreator />
          <Feed />
        </div>
      </main>
    </div>
  );
};

export default Index;
