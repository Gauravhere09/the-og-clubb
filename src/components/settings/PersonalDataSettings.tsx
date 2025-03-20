
import { ChevronRight, Facebook } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PersonalDataSettings() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Datos personales</h1>
      <p className="text-muted-foreground mb-6">
        Meta usa esta información para verificar tu identidad y para que nuestra comunidad siga siendo un lugar seguro. Tú decides qué datos personales quieres mostrar a los demás.
      </p>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div>
              <h3 className="font-medium text-left">Información de contacto</h3>
              <p className="text-sm text-muted-foreground text-left">heidergonzalez16@gmail.com</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div>
              <h3 className="font-medium text-left">Fecha de nacimiento</h3>
              <p className="text-sm text-muted-foreground text-left">21 de marzo de 2002</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div>
              <h3 className="font-medium text-left">Confirmación de identidad</h3>
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div>
              <h3 className="font-medium text-left">Propiedad y control de la cuenta</h3>
              <p className="text-sm text-muted-foreground text-left">
                Administra tus datos, modifica tu contacto de legado y desactiva o elimina tus cuentas y perfiles.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
