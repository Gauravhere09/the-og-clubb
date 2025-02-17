
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Image as ImageIcon, Mail, MapPin } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <div className="relative w-full h-48 rounded-lg bg-gradient-to-r from-primary/20 to-primary/40 mb-16">
          <Avatar className="absolute -bottom-12 left-6 w-32 h-32 border-4 border-background">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
          <Button size="icon" variant="secondary" className="absolute bottom-4 right-4">
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-1">Ana García</h1>
              <p className="text-muted-foreground mb-4">@anagarcia</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Madrid, España</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>ana.garcia@email.com</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <div>
                  <div className="font-semibold">2.5k</div>
                  <div className="text-sm text-muted-foreground">Seguidores</div>
                </div>
                <div>
                  <div className="font-semibold">1.2k</div>
                  <div className="text-sm text-muted-foreground">Siguiendo</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sobre mí</h2>
              <p className="text-muted-foreground">
                Apasionada por la tecnología y el diseño. Desarrolladora web y amante de la fotografía.
              </p>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Fotos destacadas</h2>
                <Button variant="ghost" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Añadir foto
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
