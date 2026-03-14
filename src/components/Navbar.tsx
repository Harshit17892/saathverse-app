import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, GraduationCap, MessageCircle, Users, Trophy, UserCircle, Shield, Rocket, Globe, Layers, Menu, X, LogOut, MoreHorizontal, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import saathverseLogo from "@/assets/saathverse-logo-new.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Discover", icon: Search, href: "/discover" },
  { label: "Alumni", icon: GraduationCap, href: "/alumni" },
  { label: "Requests", icon: Users, href: "/requests", badgeKey: "requests" as const },
  { label: "Chat", icon: MessageCircle, href: "/chat", badgeKey: "chat" as const },
  { label: "Hackathons", icon: Trophy, href: "/hackathons" },
  { label: "Startup", icon: Rocket, href: "/startup" },
  { label: "IEEE", icon: Globe, href: "/ieee" },
  { label: "Clubs", icon: Layers, href: "/clubs" },
  { label: "Rewards", icon: Flame, href: "/gamification" },
  { label: "Profile", icon: UserCircle, href: "/profile" },
];

// Bottom bar items: Discover, Chat, Requests, Profile, More
const bottomBarItems = [
  { label: "Discover", icon: Search, href: "/discover" },
  { label: "Chat", icon: MessageCircle, href: "/chat", badgeKey: "chat" as const },
  { label: "Requests", icon: Users, href: "/requests", badgeKey: "requests" as const },
  { label: "Profile", icon: UserCircle, href: "/profile" },
];

// "More" drawer items (everything not in bottom bar)
const moreItems = [
  { label: "Alumni", icon: GraduationCap, href: "/alumni" },
  { label: "Hackathons", icon: Trophy, href: "/hackathons" },
  { label: "Startup", icon: Rocket, href: "/startup" },
  { label: "IEEE", icon: Globe, href: "/ieee" },
  { label: "Clubs", icon: Layers, href: "/clubs" },
  { label: "Rewards", icon: Flame, href: "/gamification" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, college, isAdmin, signOut, profile, isSuperAdmin, activeCollegeId, collegeId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [badges, setBadges] = useState<{ requests: number; chat: number }>({ requests: 0, chat: 0 });
  const [displayCollegeName, setDisplayCollegeName] = useState<string | null>(null);

  const isLandingPage = !user && location.pathname === "/";

  useEffect(() => {
    if (!user) { setDisplayCollegeName(null); return; }
    if (isSuperAdmin && activeCollegeId && activeCollegeId !== college?.id) {
      supabase.from("colleges").select("name").eq("id", activeCollegeId).maybeSingle().then(({ data }) => {
        setDisplayCollegeName(data?.name || college?.name || null);
      });
    } else {
      setDisplayCollegeName(college?.name || null);
    }
  }, [user, isSuperAdmin, activeCollegeId, college]);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const { count: reqCount } = await supabase
        .from("connections").select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id).eq("status", "pending");
      const { count: chatCount } = await supabase
        .from("messages").select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id).eq("is_read", false);
      setBadges({ requests: reqCount || 0, chat: chatCount || 0 });
    };
    fetchCounts();
    const channel = supabase.channel("nav-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, () => fetchCounts())
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchCounts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSignOut = async () => { await signOut(); navigate("/login"); };
  const getBadgeCount = (badgeKey?: "requests" | "chat") => {
    if (!badgeKey || !user) return 0;
    return badges[badgeKey];
  };

  const NavBadge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
        {count > 9 ? "9+" : count}
      </span>
    );
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  if (isLandingPage) {
    return (
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={saathverseLogo} alt="SaathVerse" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain" />
            <span className="font-display text-lg sm:text-xl font-bold text-foreground">SaathVerse</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <>
      {/* Top navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={saathverseLogo} alt="SaathVerse" className="h-9 w-9 rounded-lg object-contain" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-foreground">SaathVerse</span>
              {displayCollegeName && <span className="text-[10px] text-muted-foreground leading-none">{displayCollegeName}</span>}
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <item.icon className="h-4 w-4" />
                  <NavBadge count={getBadgeCount(item.badgeKey)} />
                </div>
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-accent hover:text-accent hover:bg-accent/10 transition-colors font-medium">
                <Shield className="h-4 w-4" />Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Profile photo avatar — links to /profile */}
                <Link to="/profile" className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-border/40 hover:ring-accent/60 transition-all shrink-0">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white">
                        {(profile?.full_name || user.email || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
                <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
                <Link to="/signup" className="hidden sm:inline text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Tab Bar */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="glass border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around py-1.5">
              {bottomBarItems.map((item) => {
                const active = isActive(item.href);
                const badgeCount = getBadgeCount(item.badgeKey);
                const isProfileTab = item.href === "/profile";
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                      active ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    <div className="relative">
                      {active && (
                        <motion.div
                          layoutId="bottomTabIndicator"
                          className="absolute -inset-1.5 rounded-xl bg-accent/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      {isProfileTab ? (
                        <div className={`h-5 w-5 relative z-10 rounded-full overflow-hidden ${active ? "ring-2 ring-accent" : "ring-1 ring-border/40"}`}>
                          {profile?.photo_url ? (
                            <img src={profile.photo_url} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <span className="text-[7px] font-bold text-white">
                                {(profile?.full_name || user?.email || "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <item.icon className="h-5 w-5 relative z-10" />
                      )}
                      <NavBadge count={badgeCount} />
                    </div>
                    <span className={`text-[10px] font-medium ${active ? "text-accent" : ""}`}>{item.label}</span>
                  </Link>
                );
              })}

              {/* More button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  mobileOpen ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  {mobileOpen && (
                    <motion.div
                      className="absolute -inset-1.5 rounded-xl bg-accent/10"
                    />
                  )}
                  <MoreHorizontal className="h-5 w-5 relative z-10" />
                </div>
                <span className={`text-[10px] font-medium ${mobileOpen ? "text-accent" : ""}`}>More</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "More" drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-[60px] left-0 right-0 z-40 lg:hidden"
            >
              <div className="mx-3 mb-2 glass rounded-2xl border border-border/30 shadow-2xl overflow-hidden">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                <div className="px-3 pb-3 space-y-0.5">
                  {moreItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                          active
                            ? "text-accent bg-accent/10 font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-accent hover:bg-accent/10 transition-colors font-medium">
                      <Shield className="h-5 w-5" />Admin
                    </Link>
                  )}

                  {/* Sign out */}
                  {user && (
                    <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                      <LogOut className="h-5 w-5" />Sign out
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
