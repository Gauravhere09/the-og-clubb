
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
    
    // Redirect to auth page after logging the error
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <p className="text-gray-600 mb-4">Redirecting to login page...</p>
        <button 
          onClick={() => navigate("/auth")} 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default NotFound;
