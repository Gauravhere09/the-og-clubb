
import { Link } from "react-router-dom";

export const Logo = () => (
  <div className="hidden md:flex justify-center my-6">
    <Link to="/" className="relative w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform hover:scale-105 shadow-md">
      <span className="text-2xl font-bold text-primary-foreground">H</span>
      <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur-sm -z-10" />
    </Link>
  </div>
);
