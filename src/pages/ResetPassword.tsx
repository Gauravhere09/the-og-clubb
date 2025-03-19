import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Extract the hash fragment from the URL
    const hashFragment = window.location.hash;
    const query = new URLSearchParams(hashFragment.replace('#', ''));
    
    // Check for errors in the URL
    const errorParam = query.get('error');
    const errorDescription = query.get('error_description');
    
    if (errorParam) {
      if (errorParam === 'access_denied' && query.get('error_code') === 'otp_expired') {
        setTokenError('El enlace de restablecimiento ha expirado. Por favor, solicita un nuevo enlace.');
      } else {
        setTokenError(errorDescription || 'Error en el enlace de restablecimiento');
      }
      return;
    }
    
    // This means we're coming from an email link with a valid access token
    const accessToken = query.get('access_token');
    if (accessToken) {
      setAccessToken(accessToken);
    } else {
      // If we have type=recovery in the URL, it means we need to show the form to request a reset
      const type = query.get('type');
      if (type === 'recovery') {
        // This is a valid flow, don't show error
        return;
      }
      
      // Otherwise, coming from direct navigation, probably just entered the page manually
      setTokenError('No se encontró un token válido. Por favor, solicita un nuevo enlace de restablecimiento.');
    }
  }, [location]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
      // If we have an access token from the URL (coming from email link)
      if (accessToken) {
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
      } else {
        throw new Error("No se encontró un token válido");
      }
    } catch (error: any) {
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

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleRequestResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña",
      });
      
      setResetSent(true);
    } catch (error: any) {
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

  // If there was an error with the token
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/15 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-destructive">!</span>
          </div>
          <h2 className="text-2xl font-semibold">Error de restablecimiento</h2>
          <p className="text-muted-foreground mt-2">{tokenError}</p>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">¿Quieres solicitar un nuevo enlace?</h3>
            
            {resetSent ? (
              <div className="text-center py-4">
                <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                  ¡Correo enviado!
                </p>
                <p className="text-muted-foreground">
                  Revisa tu bandeja de entrada para continuar con el proceso.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestResetLink} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-1">
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
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleShowPassword}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleShowPassword}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </button>
            </div>
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
