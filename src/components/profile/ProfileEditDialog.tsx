
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/pages/Profile";
import type { ProfileTable } from "@/types/database/profile.types";
import { useToast } from "@/hooks/use-toast";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProfileEditDialogProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

const formSchema = z.object({
  username: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(30, "El nombre no puede tener más de 30 caracteres"),
  bio: z.string().max(500, "La biografía no puede tener más de 500 caracteres").optional().or(z.literal("")),
  career: z.string().optional().or(z.literal("")),
  semester: z.string().optional().or(z.literal("")),
});

export function ProfileEditDialog({
  profile,
  isOpen,
  onClose,
  onUpdate,
}: ProfileEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile.username || "",
      bio: profile.bio || "",
      career: profile.career || "",
      semester: profile.semester || "",
    },
  });

  // Lista de carreras para el selector actualizada según la imagen
  const careers = [
    "Derecho",
    "Música",
    "Teología",
    "Psicología",
    "Licenciatura en Bilingüismo: Español e Inglés",
    "Contaduría Pública",
    "Administración de Empresas",
    "Administración de Negocios Internacionales",
    "Administración Marítima y Portuaria",
    "Ingeniería Industrial - Tecnología en Logística Empresarial",
    "Ingeniería Informática - Tecnología en Gestión de Redes Informáticas",
    "Ingeniería Biomédica - Tecnología en Mantenimiento de Equipo Biomédico",
    "Ingeniería Ambiental - Tecnología en Desarrollo Ambiental y Sostenible"
  ];

  // Lista de semestres para el selector
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const updateData: ProfileTable['Update'] = {
        username: values.username,
        bio: values.bio || null,
        career: values.career || null,  // Asegurarse de que se guarde null si está vacío
        semester: values.semester || null,  // Asegurarse de que se guarde null si está vacío
        updated_at: new Date().toISOString(),
      };

      console.log("Enviando datos de actualización:", updateData);

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const profileData = data as ProfileTable['Row'];
        const updatedProfile: Profile = {
          ...profile,
          username: profileData.username,
          bio: profileData.bio,
          updated_at: profileData.updated_at,
          career: profileData.career,
          semester: profileData.semester
        };
        
        console.log("Perfil actualizado:", updatedProfile);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="career"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu carrera" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {careers.map((careerOption) => (
                        <SelectItem key={careerOption} value={careerOption}>
                          {careerOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Los usuarios podrán ver tu carrera en tu perfil y ranking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu semestre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {semesters.map((semesterOption) => (
                        <SelectItem key={semesterOption} value={semesterOption}>
                          {semesterOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Los usuarios podrán ver tu semestre en tu perfil y ranking
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
