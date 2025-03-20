
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
import Messages from "@/pages/Messages";
import Popularity from "@/pages/Popularity";
import Moderation from "@/pages/Moderation";
import Notifications from "@/pages/Notifications";
import Friends from "@/pages/Friends";
import NotFound from "@/pages/NotFound";
import FriendRequestsPage from "./pages/FriendRequestsPage";
import ResetPassword from "./pages/ResetPassword";
import PrivacySettings from "./pages/settings/PrivacySettings";
import AccountSettings from "./pages/settings/AccountSettings";

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/popularity" element={<Popularity />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friends/requests" element={<FriendRequestsPage />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
