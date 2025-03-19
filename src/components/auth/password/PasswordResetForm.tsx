
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordInput } from "@/components/auth/password/PasswordInput";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordResetFormProps {
  accessToken: string;
}

export function PasswordResetForm({ accessToken }: PasswordResetFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setValidations({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const hasLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    setValidations({
      length: hasLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial
    });

    // Calculate strength as percentage
    const criteria = [hasLength, hasUppercase, hasLowercase, hasNumber, hasSpecial];
    const strength = (criteria.filter(Boolean).length / criteria.length) * 100;
    setPasswordStrength(strength);
  }, [newPassword]);

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-destructive";
    if (passwordStrength < 70) return "bg-amber-500";
    return "bg-green-500";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordStrength < 40) {
      setError("La contraseña es demasiado débil. Por favor, usa una contraseña más segura.");
      return;
    }
    
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
            <Label htmlFor="new-password" className="block text-sm font-medium mb-1">
              Nueva contraseña
            </Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Nueva contraseña"
            />
            
            {newPassword && (
              <div className="mt-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Seguridad de la contraseña</span>
                    <span className={passwordStrength >= 70 ? "text-green-500" : passwordStrength >= 40 ? "text-amber-500" : "text-destructive"}>
                      {passwordStrength >= 70 ? "Fuerte" : passwordStrength >= 40 ? "Media" : "Débil"}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength} 
                    className="h-2" 
                    indicatorClassName={getStrengthColor()}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {validations.length ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-destructive" />}
                    <span>Al menos 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.uppercase ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-destructive" />}
                    <span>Al menos una mayúscula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.lowercase ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-destructive" />}
                    <span>Al menos una minúscula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.number ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-destructive" />}
                    <span>Al menos un número</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {validations.special ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-destructive" />}
                    <span>Al menos un carácter especial</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Confirmar contraseña"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive mt-1">
                Las contraseñas no coinciden
              </p>
            )}
          </div>
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
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
