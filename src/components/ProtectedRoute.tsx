import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

const isProfileSetupComplete = () =>
  sessionStorage.getItem("profile_setup_complete") === "1" ||
  localStorage.getItem("profile_setup_complete") === "1";

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
  const [profileTimeout, setProfileTimeout] = useState(false);
  const [allowWithoutProfile, setAllowWithoutProfile] = useState(
    () => isProfileSetupComplete()
  );

  // Detect super admin directly from email to avoid async timing issues
  const isSA = isSuperAdmin || SUPER_ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  useEffect(() => {
    if (loading || !user || isSA || profile) {
      setProfileTimeout(false);
      return;
    }

    const timer = window.setTimeout(() => setProfileTimeout(true), 4000);
    return () => window.clearTimeout(timer);
  }, [loading, user, isSA, profile]);

  useEffect(() => {
    if (profile?.full_name && String(profile.full_name).trim() !== "") {
      sessionStorage.removeItem("profile_setup_complete");
      localStorage.removeItem("profile_setup_complete");
      setAllowWithoutProfile(false);
      return;
    }

    setAllowWithoutProfile(isProfileSetupComplete());
  }, [profile]);

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
    if (allowWithoutProfile) {
      return <>{children}</>;
    }

    if (profileTimeout) {
      const onboardingPaths = ["/onboarding", "/admin-setup", "/complete-profile"];
      if (onboardingPaths.includes(location.pathname)) {
        return <>{children}</>;
      }

      // If user was invited as admin, redirect to admin-setup instead of student onboarding
      if (user?.user_metadata?.invited_as === "college_admin") {
        return <Navigate to="/admin-setup" replace />;
      }

      return <Navigate to="/signup?onboarding=1" replace />;
    }

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
    location.pathname !== "/admin-setup" &&
    location.pathname !== "/complete-profile"
  ) {
    return <Navigate to="/signup?onboarding=1" replace />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  if (coreTeamOnly && !(isCoreTeam || isAdmin || isSA)) return <Navigate to="/" replace />;

  return <>{children}</>;
};
