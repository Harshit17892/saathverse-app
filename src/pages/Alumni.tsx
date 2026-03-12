import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, MapPin, Briefcase, GraduationCap, ExternalLink,
  Linkedin, Mail, MessageCircle, Filter, ChevronDown, Star, Globe2,
  Building2, Calendar, Users, TrendingUp, Award, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlumni } from "@/hooks/use-supabase-data";

// --- Background ---
const ConstellationBG = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
    {Array.from({ length: 40 }).map((_, i) => {
      const cx = Math.random() * 100;
      const cy = Math.random() * 100;
      return <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r={Math.random() * 2 + 0.5} fill="hsl(263 70% 58%)" />;
    })}
    {Array.from({ length: 20 }).map((_, i) => {
      const x1 = Math.random() * 100, y1 = Math.random() * 100;
      const x2 = x1 + (Math.random() - 0.5) * 20, y2 = y1 + (Math.random() - 0.5) * 20;
      return <line key={`l${i}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="hsl(263 70% 58%)" strokeWidth="0.3" />;
    })}
  </svg>
);

const FloatingOrb = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color }}
    animate={{ y: [0, -25, 0], scale: [1, 1.12, 1], opacity: [0.1, 0.22, 0.1] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }} />
);

// --- Featured Alumni Spotlight ---
const FeaturedSpotlight = ({ alumni }: { alumni: any[] }) => {
  const featured = alumni.filter((a: any) => a.featured);
  const [active, setActive] = useState(0);

  if (featured.length === 0) return null;
  const person = featured[active];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="relative glass rounded-3xl overflow-hidden mb-10">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(263 70% 58% / 0.08), transparent 60%)" }} />
      <motion.div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
        style={{ background: "hsl(30 95% 55% / 0.06)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-display font-semibold text-accent tracking-wider uppercase">Featured Alumni</h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={person.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                {person.avatar?.startsWith("http") ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary-foreground">{person.avatar || person.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                )}
              </div>
              <motion.div className="absolute -inset-1 rounded-2xl border border-primary/30"
                animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-display font-bold text-foreground">{person.name}</h4>
              <p className="text-primary font-medium text-sm">{person.role} at {person.company}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {person.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {person.location}</span>}
                {person.batch && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Batch {person.batch}</span>}
                {person.department && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {person.department}</span>}
              </div>
              {person.achievements && person.achievements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {person.achievements.map((a: string, i: number) => (
                    <Badge key={i} className="bg-accent/10 text-accent border-accent/20 text-[10px] gap-1">
                      <Award className="h-3 w-3" /> {a}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 gap-1.5 text-xs h-8" asChild>
                  <Link to={`/profile/${person.id}`}><MessageCircle className="h-3.5 w-3.5" /> Connect</Link>
                </Button>
                {person.linkedin && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-border/50" asChild>
                    <a href={person.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-6">
          {featured.map((_: any, i: number) => (
            <button key={i} onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "bg-primary w-10" : "bg-muted-foreground/20 w-6"}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Alumni Card ---
const AlumniCard = ({ person, index }: { person: any; index: number }) => {
  // Get skills from the alumni's linked student profile if available
  const skills = person.achievements?.length ? person.achievements : [];

  return (
    <motion.div initial={{ opacity: 0, y: 25, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 150 }} className="group relative">
      <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.4), transparent, hsl(var(--primary) / 0.2))" }} />
      <div className="relative glass rounded-2xl p-5 overflow-hidden h-full flex flex-col">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="relative z-10 flex flex-col flex-1">
          {/* Avatar + Name row */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-primary/20 overflow-hidden bg-secondary/50">
                {person.avatar?.startsWith("http") ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base font-bold text-foreground">{person.avatar || person.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
                )}
              </div>
              {person.featured && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                  <Star className="h-2.5 w-2.5 text-background" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-bold text-foreground text-base truncate">{person.name}</h4>
              {person.department && (
                <p className="text-xs text-primary font-medium truncate">{person.department}</p>
              )}
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-1.5 mb-4">
            {person.company && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-primary font-medium">{person.company}</span>
              </p>
            )}
            {person.role && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                {person.role}
              </p>
            )}
            {person.batch && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                Passout: {person.batch}
              </p>
            )}
            {person.department && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                {person.department}
              </p>
            )}
            {person.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                {person.location}
              </p>
            )}
          </div>

          {/* Skills */}
          {person.specialization && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {person.specialization.split(",").map((s: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 px-2 py-0.5">
                  {s.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* View Profile link */}
          <div className="mt-auto pt-3 border-t border-border/20">
            <Link to={`/profile/${person.id}`}
              className="text-xs text-primary font-medium hover:text-primary/80 transition-colors inline-flex items-center gap-1 group/link">
              View Profile <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page ---
const Alumni = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const { data: dbAlumni = [], isLoading } = useAlumni();

  // Extract unique departments and batches from data
  const departments = ["All", ...Array.from(new Set(dbAlumni.map((a: any) => a.department).filter(Boolean)))];
  const batches = ["All", ...Array.from(new Set(dbAlumni.map((a: any) => a.batch).filter(Boolean))).sort((a: any, b: any) => b.localeCompare(a))];

  const filtered = dbAlumni.filter((a: any) => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.specialization || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === "All" || a.department === selectedDept;
    const matchBatch = selectedBatch === "All" || a.batch === selectedBatch;
    return matchSearch && matchDept && matchBatch;
  });

  const uniqueCompanies = new Set(dbAlumni.map((a: any) => a.company).filter(Boolean));
  const uniqueLocations = new Set(dbAlumni.map((a: any) => a.location).filter(Boolean));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ConstellationBG />
      <FloatingOrb delay={0} size={450} x="5%" y="15%" color="hsl(263 70% 58% / 0.06)" />
      <FloatingOrb delay={3} size={380} x="75%" y="50%" color="hsl(30 95% 55% / 0.04)" />
      <FloatingOrb delay={6} size={300} x="50%" y="80%" color="hsl(160 70% 45% / 0.04)" />
      <Navbar />

      <div className="relative z-10 pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl overflow-hidden mb-10">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(240 30% 8%), hsl(200 30% 10%), hsl(240 30% 8%))" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, hsl(263 70% 58% / 0.12), transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 85% 30%, hsl(160 70% 45% / 0.08), transparent 40%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, hsl(263 70% 58%) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
          <div className="relative z-10 p-8 md:p-12 min-h-[200px]">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(160_70%_45%)] to-primary flex items-center justify-center border border-[hsl(160_70%_45%/0.3)]">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">Alumni</h1>
                <p className="text-[hsl(160_70%_45%)] text-sm font-medium tracking-widest uppercase">Network</p>
              </div>
            </motion.div>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
              Connect with graduates who've shaped the industry. From FAANG engineers to startup founders — your network starts here.
            </p>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Users, value: `${dbAlumni.length}`, label: "Alumni Registered", color: "hsl(263 70% 58%)" },
            { icon: Building2, value: `${uniqueCompanies.size}`, label: "Companies", color: "hsl(30 95% 55%)" },
            { icon: Globe2, value: `${uniqueLocations.size}`, label: "Locations", color: "hsl(160 70% 45%)" },
            { icon: TrendingUp, value: `${dbAlumni.filter((a: any) => a.featured).length}`, label: "Featured", color: "hsl(340 80% 55%)" },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass rounded-xl p-4 flex items-center gap-3 card-hover">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${stat.color}20` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-foreground leading-none">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <FeaturedSpotlight alumni={dbAlumni} />

        {/* SEARCH & FILTERS */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alumni by name, company, or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/40 h-11 focus:border-primary/40" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-border/50 text-muted-foreground hover:text-foreground h-11">
              <Filter className="h-4 w-4" /> Filters
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 glass rounded-xl">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Department</p>
                    <div className="flex flex-wrap gap-2">
                      {departments.map((dept) => (
                        <button key={dept} onClick={() => setSelectedDept(dept as string)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedDept === dept ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}>{dept}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Batch</p>
                    <div className="flex flex-wrap gap-2">
                      {batches.map((batch) => (
                        <button key={batch} onClick={() => setSelectedBatch(batch as string)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedBatch === batch ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}>{batch}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RESULTS */}
        {isLoading ? (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Users className="h-8 w-8 text-primary mx-auto" />
            </motion.div>
            <p className="text-muted-foreground mt-4">Loading alumni...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No alumni found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{filtered.length} alumni found</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((person: any, index: number) => (
                <AlumniCard key={person.id} person={person} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Alumni;
