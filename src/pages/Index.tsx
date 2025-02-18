
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="space-y-4">
          {/* Aquí se añadirá el feed de posts y el creador de posts */}
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold">¡Bienvenido a H1Z!</h1>
            <p className="text-muted-foreground mt-2">
              Comienza a compartir y conectar con otros usuarios.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
