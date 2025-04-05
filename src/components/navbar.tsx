
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Home, 
  Headphones, 
  Plus, 
  Library, 
  User, 
  Settings, 
  LogOut 
} from "lucide-react";

export function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t z-50 md:top-0 md:left-0 md:h-full md:w-16 md:border-t-0 md:border-r">
      <div className="flex flex-row md:flex-col items-center justify-around md:justify-start h-full py-1 md:py-6">
        <div className="hidden md:flex items-center justify-center mb-8">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Headphones className="text-white w-4 h-4" />
          </div>
        </div>
        
        <NavItem 
          to="/" 
          icon={<Home />} 
          label="Home" 
          isActive={isActive('/')} 
        />
        
        <NavItem 
          to="/library" 
          icon={<Library />} 
          label="Library" 
          isActive={isActive('/library')} 
        />
        
        <NavItem 
          to="/studio" 
          icon={<Plus />} 
          label="Create" 
          isActive={isActive('/studio')} 
          highlight
        />
        
        <NavItem 
          to="/profile" 
          icon={<User />} 
          label="Profile" 
          isActive={isActive('/profile')} 
        />
        
        <NavItem 
          to="/settings" 
          icon={<Settings />} 
          label="Settings" 
          isActive={isActive('/settings')} 
        />
        
        <div className="mt-auto hidden md:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  highlight?: boolean;
}

function NavItem({ to, icon, label, isActive, highlight }: NavItemProps) {
  return (
    <Link to={to} className="w-16 flex flex-col items-center justify-center relative">
      <Button 
        variant={highlight ? "default" : isActive ? "secondary" : "ghost"} 
        size="icon" 
        className={`h-10 w-10 ${highlight ? 'bg-primary text-white' : ''}`}
      >
        {icon}
        {isActive && !highlight && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>
      <span className="text-xs mt-1 text-muted-foreground md:hidden">
        {label}
      </span>
    </Link>
  );
}
