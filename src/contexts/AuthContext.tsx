import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  collegeId: string | null;
  college: any | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCoreTeam: boolean;
  activeCollegeId: string | null;
  setActiveCollegeId: (id: string | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, loading: true,
  collegeId: null, college: null, isAdmin: false, isSuperAdmin: false, isCoreTeam: false,
  activeCollegeId: null, setActiveCollegeId: () => {},
  signOut: async () => {}, refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Super admin emails — can view/manage ALL colleges
const SUPER_ADMIN_EMAILS = ["harshit02425@gmail.com"];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [college, setCollege] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCoreTeam, setIsCoreTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCollegeId, setActiveCollegeIdState] = useState<string | null>(null);

  const setActiveCollegeId = (id: string | null) => {
    setActiveCollegeIdState(id);
    if (id) sessionStorage.setItem("activeCollegeId", id);
    else sessionStorage.removeItem("activeCollegeId");
  };

  const ensureSuperAdminActiveCollege = async () => {
    const stored = sessionStorage.getItem("activeCollegeId");

    if (stored) {
      const { data: existing } = await supabase
        .from("colleges")
        .select("id")
        .eq("id", stored)
        .maybeSingle();

      if (existing?.id) {
        setActiveCollegeIdState(existing.id);
        return;
      }

      sessionStorage.removeItem("activeCollegeId");
    }

    const { data: firstCollege } = await supabase
      .from("colleges")
      .select("id")
      .order("name", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstCollege?.id) {
      setActiveCollegeIdState(firstCollege.id);
      sessionStorage.setItem("activeCollegeId", firstCollege.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data: prof } = await supabase
      .from("profiles").select("*").eq("user_id", userId).maybeSingle();
    setProfile(prof);

    if (prof?.college_id) {
      const { data: col } = await supabase
        .from("colleges").select("*").eq("id", prof.college_id).maybeSingle();
      setCollege(col);

      const stored = sessionStorage.getItem("activeCollegeId");
      if (stored) setActiveCollegeIdState(stored);
      else setActiveCollegeIdState(prof.college_id);
    }

    return prof;
  };

  const checkRoles = async (userId: string, email: string) => {
    const { data: isGlobalAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isCollegeAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "college_admin" });
    const { data: isCore } = await supabase.rpc("has_role", { _user_id: userId, _role: "core_team" });
    const isSA = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

    if (isSA) {
      await ensureSuperAdminActiveCollege();
    }

    setIsSuperAdmin(isSA);
    setIsAdmin(!!isGlobalAdmin || !!isCollegeAdmin || isSA);
    setIsCoreTeam(!!isCore);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(async () => {
            await Promise.all([
              fetchProfile(session.user.id),
              checkRoles(session.user.id, session.user.email || ""),
            ]);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setCollege(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setIsCoreTeam(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          checkRoles(session.user.id, session.user.email || ""),
        ]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Super admins use activeCollegeId (can switch colleges), regular users use their own
  const collegeId = isSuperAdmin
    ? (activeCollegeId ?? profile?.college_id ?? null)
    : (profile?.college_id ?? null);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCollege(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsCoreTeam(false);
    sessionStorage.removeItem("activeCollegeId");
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      collegeId, college, isAdmin, isSuperAdmin, isCoreTeam,
      activeCollegeId, setActiveCollegeId,
      signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
