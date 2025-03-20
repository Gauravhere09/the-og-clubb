
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Users, UserMinus, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StoryVisibility } from "@/components/stories/utils/story-utils";

interface StoryPrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryPrivacySettings({ open, onOpenChange }: StoryPrivacySettingsProps) {
  const [selectedOption, setSelectedOption] = useState<StoryVisibility>("public");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Cargar configuración de privacidad guardada
  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('story_privacy')
            .eq('user_id', user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') { // PGRST116 es "no se encontraron resultados"
            throw error;
          }
          
          if (data?.story_privacy) {
            setSelectedOption(data.story_privacy as StoryVisibility);
          }
        }
      } catch (error) {
        console.error("Error cargando configuración de privacidad:", error);
      }
    };
    
    if (open) {
      loadPrivacySettings();
    }
  }, [open]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      
      // Upsert: inserta si no existe, actualiza si existe
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id, 
          story_privacy: selectedOption,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Configuración guardada",
        description: "Tu configuración de privacidad ha sido actualizada",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error guardando configuración:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Quién puede ver tus historias?</DialogTitle>
          <DialogDescription className="pt-2">
            Tu historia se verá durante 24 horas en Facebook y Messenger. Esta configuración no se aplica a los videos en directo que compartas en la historia.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as StoryVisibility)}>
            <div className="flex items-center space-x-3 py-3 border-b border-border">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="public" className="font-medium mb-1 block">Público</Label>
                <p className="text-sm text-muted-foreground">Cualquiera en Facebook y Messenger</p>
              </div>
              <RadioGroupItem value="public" id="public" />
            </div>

            <div className="flex items-center space-x-3 py-3 border-b border-border">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="friends" className="font-medium mb-1 block">Amigos</Label>
                <p className="text-sm text-muted-foreground">Solo tus amigos de Facebook</p>
              </div>
              <RadioGroupItem value="friends" id="friends" />
            </div>

            <div className="flex items-center space-x-3 py-3 border-b border-border">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <UserMinus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="except" className="font-medium mb-1 block">Amigos, excepto...</Label>
                <p className="text-sm text-muted-foreground">Amigos, excepto algunos usuarios específicos</p>
              </div>
              <RadioGroupItem value="except" id="except" disabled />
            </div>

            <div className="flex items-center space-x-3 py-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <UserCog className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="select" className="font-medium mb-1 block">Personalizado</Label>
                <p className="text-sm text-muted-foreground">Solo usuarios específicos</p>
              </div>
              <RadioGroupItem value="select" id="select" />
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Listo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
