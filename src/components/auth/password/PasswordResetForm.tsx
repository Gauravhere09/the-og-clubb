
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "@/components/auth/password/PasswordInput";

interface PasswordResetFormProps {
  accessToken: string;
}

export function PasswordResetForm({ accessToken }: PasswordResetFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Updating password with access token");
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido restablecida exitosamente",
      });
      
      // Redirect to login page
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Ocurrió un error al restablecer la contraseña");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al restablecer la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
          <h2 className="text-2xl font-semibold">Restablece tu contraseña</h2>
          <p className="text-muted-foreground mt-2">
            Ingresa tu nueva contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1">
              Nueva contraseña
            </label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Nueva contraseña"
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Confirmar contraseña"
            />
          </div>
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Procesando..." : "Restablecer contraseña"}
          </Button>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate("/auth")}
              disabled={loading}
            >
              Volver a inicio de sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
