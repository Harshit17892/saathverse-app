import { motion, useMotionValue, useTransform } from "framer-motion";
import { Trophy, Calendar, Users, Zap, ArrowRight, Rocket, Target, Globe2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const platformStats = [
  { icon: Users, label: "Connect", desc: "Find teammates with matching skills across departments", color: "text-primary" },
  { icon: Rocket, label: "Launch", desc: "Ship startup ideas and get AI-powered scoring", color: "text-accent" },
  { icon: Target, label: "Compete", desc: "Discover hackathons and register with one click", color: "text-primary" },
  { icon: Globe2, label: "Grow", desc: "Access IEEE research, clubs, and alumni networks", color: "text-accent" },
];

const HackathonShowcase = () => {
  const { collegeId } = useAuth();
  const { data: hackathons = [] } = useQuery({
    queryKey: ["hackathons_discover", collegeId],
    queryFn: async () => {
      let q = supabase.from("hackathons").select("*").order("created_at", { ascending: false });
      if (collegeId) {
        q = q.or(`college_id.eq.${collegeId},college_id.is.null`);
      } else {
        q = q.is("college_id", null);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const openHacks = hackathons.filter((h: any) => h.status === "open").slice(0, 3);
  const upcomingHacks = hackathons.filter((h: any) => h.status === "upcoming").slice(0, 2);
  const displayHacks = [...openHacks, ...upcomingHacks].slice(0, 4);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[180px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Platform capabilities - interactive 3D cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-accent uppercase tracking-widest mb-6 border border-accent/20"
          >
            <Zap className="h-3.5 w-3.5" />
            What You Can Do
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Campus, <span className="gradient-text">Supercharged</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Everything you need to connect, compete, and grow — in one platform.
          </p>
        </motion.div>

        {/* 3D capability cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-20 sm:mb-28"
          onMouseMove={handleMouseMove}
          style={{ perspective: "1200px" }}
        >
          {platformStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
              whileHover={{ y: -12, scale: 1.04, rotateY: 5, z: 50 }}
              className="relative group cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glow on hover */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

              <div className="relative glass rounded-2xl p-6 sm:p-7 border border-border/30 group-hover:border-primary/40 transition-all h-full overflow-hidden">
                {/* Decorative corner gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <motion.div
                  whileHover={{ rotate: 15, scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/40 flex items-center justify-center mb-5 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </motion.div>

                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {stat.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat.desc}
                </p>

                {/* Animated bottom bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hackathon section */}
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
            <Trophy className="h-3.5 w-3.5" />
            Hackathons
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Compete & <span className="gradient-text">Win Big</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Live hackathons, auto-discovered from across the web. Register instantly.
          </p>
        </motion.div>

        {/* Hackathon 3D orbital display */}
        <div
          className="relative"
          onMouseMove={handleMouseMove}
          style={{ perspective: "1400px" }}
        >
          {displayHacks.length > 0 ? (
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto"
            >
              {displayHacks.map((hack: any, i: number) => (
                <motion.div
                  key={hack.id}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -10, scale: 1.03, z: 40 }}
                  className="relative group cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => {
                    if (hack.link) window.open(hack.link, "_blank", "noopener,noreferrer");
                  }}
                >
                  {/* Gradient top edge */}
                  <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${hack.gradient || "from-primary to-accent"}`} />

                  {/* Hover glow */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />

                  <div className="relative glass rounded-2xl p-5 sm:p-6 border border-border/30 group-hover:border-primary/40 transition-all overflow-hidden">
                    {/* Status badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${
                        hack.status === "open"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-accent/10 text-accent border-accent/20"
                      }`}>
                        {hack.status === "open" ? "🟢 Open" : "🔜 Coming Soon"}
                      </span>
                      {hack.prize && (
                        <span className="flex items-center gap-1 text-xs text-accent font-bold">
                          <Trophy className="h-3.5 w-3.5" />
                          {hack.prize}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                      {hack.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                      {hack.tagline || "Build something amazing"}
                    </p>

                    {/* Tags */}
                    {hack.tags && hack.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hack.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground border border-border/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {hack.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary/60" />
                          {hack.date}
                        </span>
                      )}
                      {hack.participants != null && hack.max_participants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary/60" />
                          {hack.participants}/{hack.max_participants}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {hack.participants != null && hack.max_participants && (
                      <div className="mt-3">
                        <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${hack.gradient || "from-primary to-accent"}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min((hack.participants / hack.max_participants) * 100, 100)}%` }}
                            transition={{ duration: 1.2, delay: i * 0.15 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-12 glass rounded-2xl border border-border/30 max-w-lg mx-auto"
            >
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No hackathons yet — they'll appear here automatically!</p>
            </motion.div>
          )}

          {/* CTA to hackathons page */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link to="/hackathons">
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm border border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/5 transition-all group"
              >
                <Trophy className="h-4 w-4" />
                View All Hackathons
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HackathonShowcase;
