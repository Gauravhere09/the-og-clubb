
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { careers } from "@/data/careers";

interface RegisterFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  sendVerificationEmail: (email: string, username: string) => Promise<any>;
}

export function RegisterForm({ loading, setLoading, sendVerificationEmail }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState("");
  const { toast } = useToast();

  // Lista de semestres para el selector
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

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

  return (
    <form onSubmit={handleRegister} className="space-y-4" id="register-form" name="register-form">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Nombre de usuario
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          autoComplete="username"
        />
      </div>
      
      <div>
        <label htmlFor="career" className="block text-sm font-medium mb-1">
          Carrera estudiada
        </label>
        <Select value={career} onValueChange={setCareer} disabled={loading} name="career">
          <SelectTrigger id="career" name="career">
            <SelectValue placeholder="Selecciona tu carrera" />
          </SelectTrigger>
          <SelectContent>
            {careers.map((careerOption) => (
              <SelectItem key={careerOption} value={careerOption}>
                {careerOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="semester" className="block text-sm font-medium mb-1">
          Semestre actual
        </label>
        <Select value={semester} onValueChange={setSemester} disabled={loading} name="semester">
          <SelectTrigger id="semester" name="semester">
            <SelectValue placeholder="Selecciona tu semestre" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semesterOption) => (
              <SelectItem key={semesterOption} value={semesterOption}>
                {semesterOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="register-email"
          name="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium mb-1">
          Contraseña
        </label>
        <Input
          id="register-password"
          name="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="new-password"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Cargando..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
