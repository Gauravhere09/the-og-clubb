
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Button asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
