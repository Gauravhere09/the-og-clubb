import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PasswordResetLoading } from "@/components/auth/password/PasswordResetLoading";
import { PasswordResetError } from "@/components/auth/password/PasswordResetError";
import { PasswordResetForm } from "@/components/auth/password/PasswordResetForm";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPassword() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Extract the hash fragment from the URL
        const hashFragment = window.location.hash;
        console.log("Hash fragment:", hashFragment);
        
        // If there's no hash, this might be a direct visit to the page
        if (!hashFragment) {
          console.log("No hash fragment found, user may be visiting page directly");
          setTokenError('No se encontró un token válido. Por favor, solicita un nuevo enlace de restablecimiento.');
          return;
        }
        
        const query = new URLSearchParams(hashFragment.replace('#', ''));
        
        // Check for errors in the URL
        const errorParam = query.get('error');
        const errorCode = query.get('error_code');
        const errorDescription = query.get('error_description');
        
        if (errorParam) {
          console.log("Error detected:", errorParam, errorCode, errorDescription);
          
          if (errorParam === 'access_denied' && errorCode === 'otp_expired') {
            setTokenError('El enlace de restablecimiento ha expirado. Por favor, solicita un nuevo enlace.');
          } else {
            setTokenError(errorDescription || 'Error en el enlace de restablecimiento');
          }
          return;
        }
        
        // This means we're coming from an email link with a valid access token
        const accessToken = query.get('access_token');
        if (accessToken) {
          console.log("Valid access token found in URL");
          
          // Verify the token by checking the session
          const { data, error } = await supabase.auth.getSession();
          
          console.log("Session data:", data);
          
          if (error) {
            console.error("Error getting session:", error);
            setTokenError('Error al verificar la sesión. Por favor, intenta nuevamente.');
            return;
          }
          
          if (data.session) {
            console.log("Valid session found, token is valid");
            setAccessToken(accessToken);
            toast({
              title: "Verificación exitosa",
              description: "Por favor, establece tu nueva contraseña",
            });
          } else {
            console.log("No valid session found, token may be invalid");
            setTokenError('El token no es válido o ha expirado. Por favor, solicita un nuevo enlace de restablecimiento.');
          }
          return;
        }
        
        // If we have type=recovery in the URL, it means we need to show the form to request a reset
        const type = query.get('type');
        if (type === 'recovery') {
          // This is a valid flow, don't show error
          console.log("Recovery type detected, valid flow");
          return;
        }
        
        // Otherwise, coming from direct navigation, probably just entered the page manually
        console.log("No valid token or type parameter found");
        setTokenError('No se encontró un token válido. Por favor, solicita un nuevo enlace de restablecimiento.');
      } catch (error) {
        console.error("Error in token verification:", error);
        setTokenError('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
      } finally {
        setInitialLoading(false);
      }
    };

    verifyToken();
  }, [location, toast]);

  // Show loading state while initial checks are happening
  if (initialLoading) {
    return <PasswordResetLoading />;
  }

  // If there was an error with the token
  if (tokenError) {
    return <PasswordResetError errorMessage={tokenError} />;
  }

  // If we have a valid token, show the password reset form
  return <PasswordResetForm accessToken={accessToken!} />;
}
