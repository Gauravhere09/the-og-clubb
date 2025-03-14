
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { sendVerificationEmail } from "@/lib/auth/verification";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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

        {isLogin ? (
          <LoginForm loading={loading} setLoading={setLoading} />
        ) : (
          <RegisterForm 
            loading={loading} 
            setLoading={setLoading} 
            sendVerificationEmail={sendVerificationEmail}
          />
        )}

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
