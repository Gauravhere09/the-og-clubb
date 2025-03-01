
import { Navigation } from "@/components/Navigation";
import { Loader2, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileLayoutProps {
  isLoading?: boolean;
  error?: boolean;
  children?: React.ReactNode;
}

export function ProfileLayout({ isLoading, error, children }: ProfileLayoutProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <div className="flex-1 flex justify-center items-center md:ml-[70px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <div className="flex-1 flex justify-center items-center md:ml-[70px]">
          <Card className="max-w-md w-full p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <UserX className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold">Perfil no encontrado</h2>
              <p className="text-muted-foreground">
                Lo sentimos, el perfil que buscas no existe o no está disponible.
              </p>
              <Button onClick={() => navigate("/")} variant="default">
                Volver al inicio
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <div className="flex-1 flex justify-center md:ml-[70px] pb-20 md:pb-0">
        <main className="w-full max-w-4xl space-y-4 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
