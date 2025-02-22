
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProfileLayoutProps {
  isLoading?: boolean;
  error?: boolean;
  children?: React.ReactNode;
}

export function ProfileLayout({ isLoading, error, children }: ProfileLayoutProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-muted/30">
        <Navigation />
        <main className="flex-1 p-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Perfil no encontrado</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto">
        <div className="space-y-4">
          {children}
        </div>
      </main>
    </div>
  );
}
