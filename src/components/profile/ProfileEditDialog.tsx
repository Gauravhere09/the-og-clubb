
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/pages/Profile";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditDialogProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

export function ProfileEditDialog({
  profile,
  isOpen,
  onClose,
  onUpdate,
}: ProfileEditDialogProps) {
  const [formData, setFormData] = useState({
    username: profile.username || "",
    bio: profile.bio || "",
    career: profile.career || "",
    semester: profile.semester || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Lista de carreras para el selector
  const careers = [
    "Ingeniería Informática",
    "Ingeniería Civil",
    "Ingeniería Industrial",
    "Medicina",
    "Derecho",
    "Administración de Empresas",
    "Psicología",
    "Arquitectura",
    "Diseño Gráfico",
    "Comunicación",
    "Otra"
  ];

  // Lista de semestres para el selector
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Solo actualizar los campos que existen en la tabla de perfiles de Supabase
      const updateData: Record<string, any> = {
        username: formData.username,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      };

      // Verificamos si los campos career y semester están en la tabla
      // Sin usar la RPC ya que causa problemas de tipos
      // Simplemente vamos a intentar actualizar todos los campos
      updateData.career = formData.career;
      updateData.semester = formData.semester;

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Crear un objeto actualizado con todos los campos originales más los actualizados
        const updatedProfile: Profile = {
          ...profile,
          username: data.username,
          bio: data.bio,
          updated_at: data.updated_at,
          // Mantener los campos originales si no están en la respuesta
          career: data.career !== undefined ? data.career : profile.career,
          semester: data.semester !== undefined ? data.semester : profile.semester
        };
        
        onUpdate(updatedProfile);
        toast({
          title: "Perfil actualizado",
          description: "Los cambios han sido guardados exitosamente",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium">
              Nombre de usuario
            </label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm font-medium">
              Biografía
            </label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="career" className="text-sm font-medium">
              Carrera
            </label>
            <Select 
              value={formData.career} 
              onValueChange={(value) => setFormData((prev) => ({ ...prev, career: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu carrera" />
              </SelectTrigger>
              <SelectContent>
                {careers.map((careerOption) => (
                  <SelectItem key={careerOption} value={careerOption}>
                    {careerOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="semester" className="text-sm font-medium">
              Semestre
            </label>
            <Select 
              value={formData.semester} 
              onValueChange={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu semestre" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semesterOption) => (
                  <SelectItem key={semesterOption} value={semesterOption}>
                    {semesterOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
