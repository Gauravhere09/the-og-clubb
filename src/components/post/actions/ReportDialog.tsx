
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reportPost, ReportReason } from "@/lib/api/moderation/reports";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReportDialogProps {
  postId: string;
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDialog({ postId, userId, open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>("other");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reportar publicaciones",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await reportPost({
        postId,
        userId,
        reason,
        description,
      });

      toast({
        title: "Reporte enviado",
        description: "Gracias por ayudarnos a mantener la comunidad segura",
      });
      
      onOpenChange(false);
      // Resetear el formulario
      setReason("other");
      setDescription("");
    } catch (error) {
      console.error("Error al reportar la publicación:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reportar publicación</AlertDialogTitle>
          <AlertDialogDescription>
            Ayúdanos a mantener nuestra comunidad segura.
            Selecciona el motivo por el que quieres reportar esta publicación.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam" className="font-normal">Spam o contenido engañoso</Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="violence" id="violence" />
              <Label htmlFor="violence" className="font-normal">Violencia o contenido peligroso</Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="nudity" id="nudity" />
              <Label htmlFor="nudity" className="font-normal">Desnudos o contenido sexual</Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="hate_speech" id="hate_speech" />
              <Label htmlFor="hate_speech" className="font-normal">Discurso de odio o acoso</Label>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal">Otro motivo</Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe por qué estás reportando esta publicación"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar reporte"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
