
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function PasswordResetDialog({ open, onOpenChange, email: initialEmail, loading, setLoading }: PasswordResetDialogProps) {
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Always use the full public-facing URL for the site, not just origin
      // This is important for production deployments with Lovable
      const redirectUrl = "https://preview--hsocial-com-83.lovable.app/reset-password";
      console.log("Using redirect URL:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: "Correo enviado",
        description: "Revisa tu email para restablecer tu contraseña",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </DialogDescription>
        </DialogHeader>
        
        {resetSent ? (
          <div className="py-6 text-center">
            <p className="text-green-600 dark:text-green-400 font-medium mb-2">¡Correo enviado!</p>
            <p>Revisa tu bandeja de entrada para continuar con el proceso de restablecimiento de contraseña.</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reset-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !resetEmail}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
