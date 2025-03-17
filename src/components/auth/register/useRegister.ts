
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useRegister(setLoading: (loading: boolean) => void, sendVerificationEmail: (email: string, username: string) => Promise<any>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState("");
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que los campos obligatorios estén completos
      if (!career) {
        throw new Error("Por favor selecciona una carrera");
      }
      if (!semester) {
        throw new Error("Por favor selecciona un semestre");
      }

      // Primero registramos al usuario
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            career,
            semester,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;

      // También actualizamos la tabla de perfiles con los nuevos campos
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
          career,
          semester,
        });
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Enviar correo de verificación personalizado
        try {
          await sendVerificationEmail(email, username);
          console.log("Correo de verificación enviado exitosamente");
        } catch (emailError) {
          console.error("Error al enviar correo personalizado:", emailError);
          // Continuamos con el proceso aunque falle el envío del correo personalizado
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Por favor revisa tu correo electrónico para verificar tu cuenta. Te hemos enviado instrucciones detalladas sobre los siguientes pasos.",
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    career,
    setCareer,
    semester,
    setSemester,
    handleRegister
  };
}
