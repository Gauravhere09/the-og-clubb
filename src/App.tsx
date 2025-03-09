
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Popularity from "./pages/Popularity";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Clear the query cache when logging out to prevent data persistence issues
      if (!session) {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={session ? <Index /> : <Navigate to="/auth" replace />} />
              <Route path="/messages" element={session ? <Messages /> : <Navigate to="/auth" replace />} />
              <Route 
                path="/notifications" 
                element={session ? <Notifications /> : <Navigate to="/auth" replace />} 
              />
              <Route path="/profile" element={<Navigate to="/" replace />} />
              <Route 
                path="/profile/:id" 
                element={session ? <Profile /> : <Navigate to="/auth" replace />} 
              />
              <Route 
                path="/popularity" 
                element={session ? <Popularity /> : <Navigate to="/auth" replace />} 
              />
              <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
