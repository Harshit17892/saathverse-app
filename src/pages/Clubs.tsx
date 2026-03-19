import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Calendar, Star, Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useClubs } from "@/hooks/use-supabase-data";
import { categories, categoryColors, categoryTextColors } from "@/data/clubsData";
import { useAuth } from "@/contexts/AuthContext";

// Floating geometric shapes
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
      <defs>
        <pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
          <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
    {[
      { shape: "triangle", x: "10%", y: "20%", size: 40, delay: 0 },
      { shape: "diamond", x: "85%", y: "15%", size: 30, delay: 1 },
      { shape: "hexagon", x: "70%", y: "60%", size: 50, delay: 2 },
      { shape: "triangle", x: "20%", y: "70%", size: 25, delay: 1.5 },
      { shape: "diamond", x: "90%", y: "80%", size: 35, delay: 0.5 },
    ].map((s, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ left: s.x, top: s.y }}
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 8 + i * 2, repeat: Infinity, delay: s.delay }}
      >
        {s.shape === "triangle" && (
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-primary/20" />
        )}
        {s.shape === "diamond" && <div className="w-8 h-8 bg-accent/10 rotate-45 rounded-sm" />}
        {s.shape === "hexagon" && (
          <div className="w-12 h-12 bg-primary/10 rounded-lg rotate-12" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
        )}
      </motion.div>
    ))}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
  </div>
);

const AnimatedCount = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const step = Math.ceil(target / 40);
          const interval = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(interval); }
            else setCount(start);
          }, 30);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Clubs = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: dbClubs = [], isLoading } = useClubs();
  const { user } = useAuth();

  const filtered = dbClubs.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const featured = dbClubs.slice(0, 3);
  const totalMembers = dbClubs.reduce((a: number, c: any) => a + (c.members || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <FloatingShapes />
        <div className="hero-glow absolute inset-0" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">
              Campus <span className="gradient-text">Societies</span> & Clubs
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8">Find your tribe. Build something together.</p>

            <div className="flex items-center justify-center gap-6 md:gap-10 mb-10 text-sm">
              {[
                { label: "Active Clubs", value: dbClubs.length },
                { label: "Members", value: totalMembers, suffix: "+" },
                { label: "Events This Semester", value: dbClubs.filter((c: any) => c.next_event).length },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className="font-display text-2xl font-bold text-foreground">
                    <AnimatedCount target={s.value} suffix={s.suffix} />
                  </span>
                  <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="flex justify-center mb-8">
                <Link
                  to="/clubs/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-95 transition-opacity"
                >
                  Register a New Club <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="relative max-w-lg mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs, societies..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
              {categories.map((cat) => (
                <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap relative ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                  }`}>
                  {cat}
                  {activeCategory === cat && (
                    <motion.div layoutId="activePill" className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-3 mb-10">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              <h2 className="font-display text-3xl font-bold text-foreground">Featured This Week</h2>
            </motion.div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {featured.map((club: any, i: number) => (
                <motion.div key={club.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }} whileHover={{ y: -8, scale: 1.02 }} className="min-w-[340px] md:min-w-[400px] snap-center">
                  <Link to={`/clubs/${club.slug}`}>
                    <div className="relative rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] animate-[gradient-shift_3s_linear_infinite] -z-0">
                        <div className="w-full h-full rounded-2xl bg-card" />
                      </div>
                      <div className="relative z-10 p-[1px]">
                        <div className={`h-48 bg-gradient-to-br ${club.banner_gradient || "from-blue-600/40 to-primary/30"} rounded-t-2xl flex items-center justify-center relative overflow-hidden`}>
                          <svg className="absolute inset-0 w-full h-full opacity-10">
                            <line x1="0" y1="50%" x2="100%" y2="20%" stroke="currentColor" strokeWidth="0.5" />
                            <line x1="20%" y1="0" x2="80%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
                          </svg>
                          <div className="w-20 h-20 rounded-full bg-background/30 backdrop-blur-md border-2 border-accent/50 flex items-center justify-center shadow-[0_0_30px_hsl(var(--accent)/0.3)]">
                            <span className="font-display text-3xl font-bold text-foreground">{club.logo_letter || club.name?.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="p-5 bg-card/80 backdrop-blur-xl rounded-b-2xl">
                          <h3 className="font-display text-lg font-bold text-foreground mb-1">{club.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{club.members || 0} members</span>
                          </div>
                          {club.next_event && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                              <Calendar className="h-3 w-3" />{club.next_event}
                            </div>
                          )}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold">
                            Join Club
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLUBS GRID */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-display text-3xl font-bold text-foreground mb-10">All Societies</motion.h2>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 bg-primary rounded-full mx-auto mb-6" />
                <p className="text-muted-foreground">Loading clubs...</p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center py-32 relative">
                <FloatingShapes />
                <div className="relative z-10">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 bg-accent rounded-full mx-auto mb-6" />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">No clubs yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">Be the first to join when your college goes live on SaathVerse.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((club: any, i: number) => (
                  <motion.div key={club.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -6 }} className="group">
                    <Link to={`/clubs/${club.slug}`}>
                      <div className="relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 rounded-2xl p-[1px] opacity-50 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_auto] animate-[gradient-shift_4s_linear_infinite]">
                          <div className="w-full h-full rounded-2xl bg-card" />
                        </div>
                        <div className="relative z-10">
                          <div className={`h-36 bg-gradient-to-br ${club.banner_gradient || "from-blue-600/40 to-primary/30"} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-background/20" />
                            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r ${categoryColors[club.category] || "from-blue-500/80 to-blue-600/80"} text-foreground backdrop-blur-sm`}>
                              {club.category || "General"}
                            </div>
                          </div>
                          <div className="relative px-5">
                            <div className="absolute -top-7 left-5 w-14 h-14 rounded-xl bg-card border-2 border-accent/40 flex items-center justify-center shadow-[0_0_20px_hsl(var(--accent)/0.2)]">
                              <span className="font-display text-xl font-bold text-foreground">{club.logo_letter || club.name?.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="pt-10 pb-5 px-5 bg-card">
                            <h3 className="font-display text-base font-bold text-foreground mb-1">{club.name}</h3>
                            <p className="text-muted-foreground text-xs mb-3 line-clamp-1">{club.description || club.tagline}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((n) => (
                                  <div key={n} className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                                    <span className="text-[8px] text-muted-foreground font-medium">{n}</span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{club.members || 0} members</span>
                            </div>
                            {club.next_event && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-medium mb-4">
                                <Calendar className="h-3 w-3" />{club.next_event}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />{club.members || 0}
                              </span>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="px-4 py-1.5 rounded-lg border border-accent/40 text-accent text-xs font-medium hover:bg-accent/10 hover:shadow-[0_0_20px_hsl(var(--accent)/0.2)] transition-all"
                                onClick={(e) => e.preventDefault()}>
                                Join Club
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
      <style>{`@keyframes gradient-shift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>
    </div>
  );
};

export default Clubs;
