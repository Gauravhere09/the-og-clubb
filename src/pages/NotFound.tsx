
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Redirect to home page after logging the error
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">¡Ups! Página no encontrada</p>
        <p className="text-muted-foreground mb-4">Redirigiendo a la página de inicio...</p>
        <button 
          onClick={() => navigate("/")} 
          className="text-primary hover:text-primary/80 underline"
        >
          Ir a Inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
