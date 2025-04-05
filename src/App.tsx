
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import Explore from "@/pages/Explore";
import Studio from "@/pages/Studio";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import AudioPlayer from "@/pages/AudioPlayer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/player/:id" element={<AudioPlayer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
