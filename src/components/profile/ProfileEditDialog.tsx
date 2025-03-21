
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/pages/Profile";
import type { ProfileTable } from "@/types/database/profile.types";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ProfileBasicInfo } from "./form/ProfileBasicInfo";
import { CareerSelect } from "./form/CareerSelect";
import { SemesterSelect } from "./form/SemesterSelect";
import { formSchema, type ProfileFormValues } from "./form/profileSchema";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile.username || "",
      bio: profile.bio || "",
      career: profile.career || "",
      semester: profile.semester || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
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
        // Convert the returned data to our Profile type
        const profileData = data as unknown as ProfileTable['Row'];
        const updatedProfile: Profile = {
          ...profile,
          username: profileData.username,
          bio: profileData.bio,
          updated_at: profileData.updated_at,
          career: profileData.career,
          semester: profileData.semester,
          birth_date: profileData.birth_date
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
            <ProfileBasicInfo form={form} />
            
            <CareerSelect form={form} />
            
            <SemesterSelect form={form} />
            
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
