import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fallbackBranches = [
  { name: "Engineering & Technology", slug: "engineering-technology", icon: "⚙️", priority: 0 },
  { name: "Computer Applications", slug: "computer-applications", icon: "💻", priority: 1 },
  { name: "Medical", slug: "medical", icon: "🩺", priority: 2 },
  { name: "Science", slug: "science", icon: "🔬", priority: 3 },
  { name: "Commerce", slug: "commerce", icon: "📊", priority: 4 },
  { name: "Management", slug: "management", icon: "📈", priority: 5 },
  { name: "Arts & Humanities", slug: "arts-humanities", icon: "🎨", priority: 6 },
  { name: "Law", slug: "law", icon: "⚖️", priority: 7 },
  { name: "Education", slug: "education", icon: "📚", priority: 8 },
  { name: "Architecture & Planning", slug: "architecture-planning", icon: "🏛️", priority: 9 },
  { name: "Design", slug: "design", icon: "✏️", priority: 10 },
  { name: "Diploma", slug: "diploma", icon: "📐", priority: 11 },
  { name: "Agriculture", slug: "agriculture", icon: "🌾", priority: 12 },
  { name: "Pharmacy", slug: "pharmacy", icon: "💊", priority: 13 },
  { name: "Nursing & Paramedical", slug: "nursing-paramedical", icon: "🏥", priority: 14 },
];

const iconMap: Record<string, string> = {
  code: "💻", beaker: "🔬", calculator: "📊", briefcase: "📈",
  palette: "🎨", scale: "⚖️", book: "📚", building: "🏛️",
  pencil: "✏️", leaf: "🌾", pill: "💊", heart: "🏥",
  wrench: "⚙️", stethoscope: "🩺", ruler: "📐", computer: "💻",
};

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

const INITIAL_COUNT = 6;

const BranchesSection = () => {
  const { collegeId } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const { data: dbBranches = [] } = useQuery({
    queryKey: ["branches_college", collegeId],
    queryFn: async () => {
      let query = supabase.from("branches").select("*").order("name");
      if (collegeId) query = query.eq("college_id", collegeId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const branches = dbBranches.length > 2
    ? (() => {
        const mapped = Array.from(new Map(dbBranches.map((b: any) => [b.slug, {
          name: b.name,
          slug: b.slug,
          icon: iconMap[b.icon] || slugIconMap[b.slug] || "📚",
        }])).values());
        // Put Engineering & Technology first
        const engIdx = mapped.findIndex((b: any) => b.slug === "engineering-technology");
        if (engIdx > 0) {
          const [eng] = mapped.splice(engIdx, 1);
          mapped.unshift(eng);
        }
        return mapped;
      })()
    : fallbackBranches;

  const visible = showAll ? branches : branches.slice(0, INITIAL_COUNT);
  const hasMore = branches.length > INITIAL_COUNT;

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full bg-primary/5 blur-[180px]" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
          <motion.span initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-primary uppercase tracking-widest mb-6 border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />Browse
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-5">
            Explore by <span className="gradient-text">Branch</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg px-2">
            Find students from any department across the university.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2.5 sm:gap-4 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {visible.map((branch: any, i: number) => (
              <Link key={branch.slug} to={`/branch/${branch.slug}`}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
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
          </AnimatePresence>
        </motion.div>

        {/* View More / View Less button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            <motion.button
              onClick={() => setShowAll(!showAll)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group glass px-6 py-3 rounded-2xl text-sm font-semibold text-foreground border border-border/30 hover:border-primary/40 transition-all flex items-center gap-2"
            >
              {showAll ? "Show Less" : `+${branches.length - INITIAL_COUNT} View More`}
              <motion.span
                animate={{ rotate: showAll ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4 text-primary" />
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BranchesSection;
