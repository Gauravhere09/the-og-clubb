
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Globe, Users, UserMinus, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PrivacyOption = "public" | "friends" | "except" | "custom";

interface StoryPrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryPrivacySettings({ open, onOpenChange }: StoryPrivacySettingsProps) {
  const [selectedOption, setSelectedOption] = useState<PrivacyOption>("custom");
  const { toast } = useToast();

  const handleSave = () => {
    // This would typically save to a database in a real implementation
    toast({
      title: "Configuración guardada",
      description: "Tu configuración de privacidad ha sido actualizada",
    });
    onOpenChange(false);
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
          <RadioGroup value={selectedOption} onValueChange={(value) => setSelectedOption(value as PrivacyOption)}>
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
                <p className="text-sm text-muted-foreground">Amigos, excepto: Jesús, Yulian Smith De La Rosa, Juan Carlos Perea, Angélica González, Robert Machacon y 2 personas más</p>
              </div>
              <RadioGroupItem value="except" id="except" />
            </div>

            <div className="flex items-center space-x-3 py-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary">
                <UserCog className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <Label htmlFor="custom" className="font-medium mb-1 block">Personalizado</Label>
                <p className="text-sm text-muted-foreground">Daniel Quintero</p>
              </div>
              <RadioGroupItem value="custom" id="custom" />
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Listo</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
