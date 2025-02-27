
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [career, setCareer] = useState("");
  const [semester, setSemester] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const sendVerificationEmail = async (email: string, username: string) => {
    try {
      const response = await fetch(
        "https://wgbbaxvuuinubkgffpiq.supabase.co/functions/v1/send-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, username }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar el correo de verificación");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        // Validar que los campos obligatorios estén completos (solo para registro)
        if (!career && !isLogin) {
          throw new Error("Por favor selecciona una carrera");
        }
        if (!semester && !isLogin) {
          throw new Error("Por favor selecciona un semestre");
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              career,
              semester,
            },
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
        }

        // Enviar correo de verificación personalizado
        await sendVerificationEmail(email, username);

        toast({
          title: "¡Registro exitoso!",
          description: "Por favor revisa tu correo electrónico para verificar tu cuenta. Te hemos enviado instrucciones detalladas sobre los siguientes pasos.",
        });
      }
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

  // Lista de carreras actualizada según la imagen
  const careers = [
    "Derecho",
    "Música",
    "Teología",
    "Psicología",
    "Licenciatura en Bilingüismo: Español e Inglés",
    "Contaduría Pública",
    "Administración de Empresas",
    "Administración de Negocios Internacionales",
    "Administración Marítima y Portuaria",
    "Ingeniería Industrial - Tecnología en Logística Empresarial",
    "Ingeniería Informática - Tecnología en Gestión de Redes Informáticas",
    "Ingeniería Biomédica - Tecnología en Mantenimiento de Equipo Biomédico",
    "Ingeniería Ambiental - Tecnología en Desarrollo Ambiental y Sostenible"
  ];

  // Lista de semestres para el selector
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">H</span>
          </div>
          <h2 className="text-2xl font-semibold">{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Bienvenido de nuevo" : "Regístrate para comenzar"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Nombre de usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="career" className="block text-sm font-medium mb-1">
                  Carrera estudiada
                </label>
                <Select value={career} onValueChange={setCareer} disabled={loading}>
                  <SelectTrigger>
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
                <Select value={semester} onValueChange={setSemester} disabled={loading}>
                  <SelectTrigger>
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
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Cargando..."
              : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}
