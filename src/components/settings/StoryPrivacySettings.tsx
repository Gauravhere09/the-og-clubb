
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoryVisibility, saveUserStoryPrivacySetting } from "@/components/stories/utils/story-utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StoryPrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryPrivacySettings({ open, onOpenChange }: StoryPrivacySettingsProps) {
  const [visibility, setVisibility] = useState<StoryVisibility>("public");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchPrivacySettings(user.id);
      }
    }
    
    if (open) {
      fetchCurrentUser();
    }
  }, [open]);

  async function fetchPrivacySettings(userId: string) {
    setIsLoading(true);
    try {
      // Use casting to bypass type checking for RPC call
      const rpcCall = supabase.rpc as any;
      const { data, error } = await rpcCall('get_user_story_privacy', { 
        user_id_input: userId 
      });
      
      if (error) throw error;
      
      // Validate data before using it
      if (data && typeof data === 'string' && 
          (data === 'public' || data === 'friends' || data === 'select' || data === 'except')) {
        setVisibility(data as StoryVisibility);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSettings() {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const success = await saveUserStoryPrivacySetting(userId, visibility);
      
      if (success) {
        toast({
          title: "Configuración guardada",
          description: "La configuración de privacidad de tus historias ha sido actualizada."
        });
        onOpenChange(false);
      } else {
        throw new Error("Error saving privacy settings");
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración de privacidad."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Privacidad de historias</DialogTitle>
          <DialogDescription>
            Configura quién puede ver tus historias
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={visibility} 
            onValueChange={(value) => setVisibility(value as StoryVisibility)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium">Público</Label>
                <p className="text-sm text-muted-foreground">
                  Cualquier persona puede ver tus historias
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="friends" id="friends" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="friends" className="font-medium">Amigos</Label>
                <p className="text-sm text-muted-foreground">
                  Solo tus amigos pueden ver tus historias
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="select" id="select" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="select" className="font-medium">Algunos amigos</Label>
                <p className="text-sm text-muted-foreground">
                  Solo los amigos que selecciones pueden ver tus historias
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="except" id="except" className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor="except" className="font-medium">Todos excepto...</Label>
                <p className="text-sm text-muted-foreground">
                  Todos tus amigos excepto algunos que selecciones
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
