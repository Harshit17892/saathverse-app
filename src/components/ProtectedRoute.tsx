import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

// Super admin emails — must match AuthContext
const SUPER_ADMIN_EMAILS = ["harshit02425@gmail.com"];

export const ProtectedRoute = ({
  children,
  adminOnly = false,
  coreTeamOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  coreTeamOnly?: boolean;
}) => {
  const { user, loading, isAdmin, isSuperAdmin, isCoreTeam, profile } = useAuth();
  const location = useLocation();

  // Detect super admin directly from email to avoid async timing issues
  const isSA = isSuperAdmin || SUPER_ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Activity className="h-8 w-8 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Super admins bypass all profile checks — their profile may be null due to RLS
  // (profiles RLS requires college_id, but super admins have none)
  if (isSA) {
    if (adminOnly && !isAdmin && !isSA) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // Wait for profile to load before redirecting
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Activity className="h-8 w-8 text-accent" />
        </motion.div>
      </div>
    );
  }

  // Redirect to onboarding if profile is incomplete (but not if already on onboarding)
  if (
    (!profile.full_name || profile.full_name.trim() === "") &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/admin-setup"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  if (coreTeamOnly && !(isCoreTeam || isAdmin || isSA)) return <Navigate to="/" replace />;

  return <>{children}</>;
};
