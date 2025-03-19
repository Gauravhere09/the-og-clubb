
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface PasswordResetErrorProps {
  errorMessage: string;
}

export function PasswordResetError({ errorMessage }: PasswordResetErrorProps) {
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Always use the full public-facing URL for redirects
      const redirectUrl = "https://preview--hsocial-com-83.lovable.app/reset-password";
      console.log("Requesting password reset with redirectTo:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña",
      });
      
      setResetSent(true);
    } catch (error: any) {
      console.error("Error requesting reset link:", error);
      setError(error.message || "Ocurrió un error al enviar el correo de restablecimiento");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al enviar el correo de restablecimiento",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/15 rounded-xl flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">Error de restablecimiento</h2>
        
        <Alert variant="destructive" className="text-left">
          <AlertTitle>No se pudo restablecer la contraseña</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">¿Quieres solicitar un nuevo enlace?</h3>
          
          {resetSent ? (
            <div className="text-center py-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-4">
                <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                  ¡Correo enviado!
                </p>
                <p className="text-muted-foreground">
                  Revisa tu bandeja de entrada para continuar con el proceso.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestResetLink} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium mb-1 text-left">
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
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar nuevo enlace"}
              </Button>
            </form>
          )}
        </div>
        
        <Button 
          onClick={() => navigate("/auth")} 
          variant="outline"
          className="w-full mt-4"
        >
          Volver a inicio de sesión
        </Button>
      </div>
    </div>
  );
}
