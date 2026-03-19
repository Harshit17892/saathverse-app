import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Admin from "./pages/Admin";
import Chat from "./pages/Chat";
import Hackathons from "./pages/Hackathons";
import Requests from "./pages/Requests";
import Startup from "./pages/Startup";
import StartupChat from "./pages/StartupChat";
import IEEE from "./pages/IEEE";
import Alumni from "./pages/Alumni";
import BranchDetail from "./pages/BranchDetail";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Clubs from "./pages/Clubs";
import ClubDetailPage from "./pages/ClubDetail";
import ClubLeaderDashboard from "./pages/ClubLeaderDashboard";
import CoreTeamDashboard from "./pages/CoreTeamDashboard";
import RegisterClub from "./pages/RegisterClub";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Gamification from "./pages/Gamification";
import AdminSetup from "./pages/AdminSetup";
import CompleteProfile from "./pages/CompleteProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Signup />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* Protected routes */}
            <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/startup" element={<ProtectedRoute><Startup /></ProtectedRoute>} />
            <Route path="/startup/:startupId/chat" element={<ProtectedRoute><StartupChat /></ProtectedRoute>} />
            <Route path="/ieee" element={<ProtectedRoute><IEEE /></ProtectedRoute>} />
            <Route path="/alumni" element={<ProtectedRoute><Alumni /></ProtectedRoute>} />
            <Route path="/branch/:branchSlug" element={<ProtectedRoute><BranchDetail /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
            <Route path="/clubs/register" element={<ProtectedRoute><RegisterClub /></ProtectedRoute>} />
            <Route path="/clubs/:clubSlug" element={<ProtectedRoute><ClubDetailPage /></ProtectedRoute>} />
            <Route path="/club/dashboard" element={<ProtectedRoute><ClubLeaderDashboard /></ProtectedRoute>} />
            <Route path="/core-team" element={<ProtectedRoute coreTeamOnly><CoreTeamDashboard /></ProtectedRoute>} />
            <Route path="/gamification" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
            <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
            <Route path="/admin-setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
