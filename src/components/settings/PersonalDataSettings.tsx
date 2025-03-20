
import { ChevronRight, Facebook, Mail, Calendar, UserX } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function PersonalDataSettings() {
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(2002, 2, 21)); // March 21, 2002
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("heidergonzalez16@gmail.com");
  const { toast } = useToast();
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  const handleDateSave = async () => {
    try {
      // Here you would update the date in your database
      // const { error } = await supabase.from('profiles').update({ birth_date: date }).eq('id', userId);
      
      toast({
        title: "Fecha actualizada",
        description: "Tu fecha de nacimiento ha sido actualizada correctamente."
      });
      
      setDateDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la fecha de nacimiento."
      });
    }
  };
  
  const handleAccountDeactivation = async () => {
    try {
      // Here you would implement account deactivation logic
      // const { error } = await supabase.from('profiles').update({ status: 'inactive' }).eq('id', userId);
      
      toast({
        title: "Cuenta desactivada",
        description: "Tu cuenta ha sido desactivada temporalmente."
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo desactivar la cuenta."
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Datos personales</h1>
      <p className="text-muted-foreground mb-6">
        Meta usa esta información para verificar tu identidad y para que nuestra comunidad siga siendo un lugar seguro. Tú decides qué datos personales quieres mostrar a los demás.
      </p>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-left">Información de contacto</h3>
                <p className="text-sm text-muted-foreground text-left">{userEmail}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button 
            className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
            onClick={() => setDateDialogOpen(true)}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-left">Fecha de nacimiento</h3>
                <p className="text-sm text-muted-foreground text-left">{formatDate(date)}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Facebook className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-left">Confirmación de identidad</h3>
                <p className="text-sm text-muted-foreground text-left">Próximamente</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <div className="flex items-center gap-3">
              <UserX className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-left">Propiedad y control de la cuenta</h3>
                <p className="text-sm text-muted-foreground text-left">
                  Administra tus datos, modifica tu contacto de legado y desactiva o elimina tus cuentas y perfiles.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* Date of Birth Dialog */}
      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fecha de nacimiento</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={{ after: new Date() }}
              className="rounded-md border"
            />
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDateSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Deactivation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Propiedad y control de la cuenta</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">¿Qué acción deseas realizar en tu cuenta?</p>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleAccountDeactivation}
              >
                Desactivar temporalmente mi cuenta
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
              >
                Eliminar permanentemente mi cuenta
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
