import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const fallbackBranches = [
  { name: "Diploma", slug: "diploma", icon: "📐" },
  { name: "Engineering & Technology", slug: "engineering-technology", icon: "⚙️" },
  { name: "Medical", slug: "medical", icon: "🩺" },
  { name: "Science", slug: "science", icon: "🔬" },
  { name: "Commerce", slug: "commerce", icon: "📊" },
  { name: "Management", slug: "management", icon: "📈" },
  { name: "Arts & Humanities", slug: "arts-humanities", icon: "🎨" },
  { name: "Law", slug: "law", icon: "⚖️" },
  { name: "Education", slug: "education", icon: "📚" },
  { name: "Architecture & Planning", slug: "architecture-planning", icon: "🏛️" },
  { name: "Design", slug: "design", icon: "✏️" },
  { name: "Agriculture", slug: "agriculture", icon: "🌾" },
  { name: "Pharmacy", slug: "pharmacy", icon: "💊" },
  { name: "Nursing & Paramedical", slug: "nursing-paramedical", icon: "🏥" },
];

const iconMap: Record<string, string> = {
  code: "💻", beaker: "🔬", calculator: "📊", briefcase: "📈",
  palette: "🎨", scale: "⚖️", book: "📚", building: "🏛️",
  pencil: "✏️", leaf: "🌾", pill: "💊", heart: "🏥",
  wrench: "⚙️", stethoscope: "🩺", ruler: "📐", computer: "💻",
};

// Map branch slugs to correct icons as a fallback
const slugIconMap: Record<string, string> = {
  "engineering-technology": "⚙️",
  "computer-applications": "💻",
  "medical": "🩺",
  "science": "🔬",
  "commerce": "📊",
  "management": "📈",
  "arts-humanities": "🎨",
  "law": "⚖️",
  "education": "📚",
  "architecture-planning": "🏛️",
  "design": "✏️",
  "diploma": "📐",
  "agriculture": "🌾",
  "pharmacy": "💊",
  "nursing-paramedical": "🏥",
};

const nameIconMap: Record<string, string> = {
  "Diploma": "📐",
  "Engineering & Technology": "⚙️",
  "Medical": "🩺",
  "Science": "🔬",
  "Commerce": "📊",
  "Management": "📈",
  "Arts & Humanities": "🎨",
  "Law": "⚖️",
  "Education": "📚",
  "Architecture & Planning": "🏛️",
  "Design": "✏️",
  "Agriculture": "🌾",
  "Pharmacy": "💊",
  "Nursing & Paramedical": "🏥",
};

const getBranchIcon = (branch: { name?: string; slug?: string; icon?: string }) => {
  const normalizedSlug = (branch.slug || "").replace(/-[a-f0-9]{8}$/i, "");
  return (
    slugIconMap[normalizedSlug] ||
    nameIconMap[branch.name || ""] ||
    iconMap[branch.icon || ""] ||
    "📚"
  );
};

const FeaturesSection = () => {
  const { collegeId } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showAllMobileBranches, setShowAllMobileBranches] = useState(false);

  const { data: dbBranches = [] } = useQuery({
    queryKey: ["branches_college", collegeId],
    queryFn: async () => {
      let q = supabase.from("branches").select("*").order("name");
      if (collegeId) q = q.eq("college_id", collegeId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const branches = dbBranches.length > 2
    ? (() => {
        const mapped = Array.from(new Map(dbBranches.map((b: any) => [b.slug, {
          name: b.name,
          slug: b.slug,
          icon: getBranchIcon({ name: b.name, slug: b.slug, icon: b.icon }),
        }])).values());
        const engIdx = mapped.findIndex((b: any) => b.slug === "engineering-technology");
        if (engIdx > 0) { const [eng] = mapped.splice(engIdx, 1); mapped.unshift(eng); }
        return mapped;
      })()
    : fallbackBranches;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const mobileVisibleCount = 8;
  const visibleBranches = showAllMobileBranches
    ? branches
    : branches.slice(0, mobileVisibleCount);

  return (
    <section className="py-16 sm:py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] rounded-full bg-primary/3 blur-[200px]" />
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-accent/5 blur-[180px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-primary uppercase tracking-widest mb-6 border border-primary/20"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Explore
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-5">
            Discover by <span className="gradient-text">Branch</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-lg px-2 mb-8">
            Find students, teams & opportunities across every department.
          </p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group overflow-hidden rounded-2xl"
          >
            {/* Animated border */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"
              style={{ background: "conic-gradient(from 0deg, hsl(var(--primary)/0.4), hsl(var(--accent)/0.6), transparent 40%, hsl(var(--primary)/0.3))" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative flex items-center bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 group-focus-within:border-transparent transition-colors">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ml-3 sm:ml-5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, skills, branches..."
                className="flex-1 min-w-0 bg-transparent h-12 sm:h-14 px-2 sm:px-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 sm:h-10 px-3 sm:px-5 mr-1.5 sm:mr-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-accent-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Search
              </motion.button>
            </div>
          </motion.form>
        </motion.div>

        {/* Branch chips */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2.5 sm:gap-4 max-w-5xl mx-auto"
        >
          {visibleBranches.map((branch: any, i: number) => (
            <Link key={branch.slug} to={`/branch/${branch.slug}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="relative group"
              >
                <div className="relative glass px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-foreground border border-border/30 group-hover:border-primary/40 transition-all flex items-center gap-2 sm:gap-2.5 cursor-pointer">
                  <span className="text-sm sm:text-base">{branch.icon}</span>
                  <span className="whitespace-nowrap">{branch.name}</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/0 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {branches.length > mobileVisibleCount && (
          <div className="mt-4 flex justify-center md:hidden">
            <button
              type="button"
              onClick={() => setShowAllMobileBranches((prev) => !prev)}
              className="glass rounded-full border border-border/40 px-4 py-2 text-xs font-semibold text-foreground"
            >
              {showAllMobileBranches ? "Show less" : "+more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
