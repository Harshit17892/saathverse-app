import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Star, Gift, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGamification } from "@/hooks/use-gamification";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const levelTitles: Record<number, string> = {
  1: "Freshman", 2: "Explorer", 3: "Achiever", 4: "Champion",
  5: "Legend", 6: "Master", 7: "Grandmaster", 8: "Titan",
  9: "Mythic", 10: "Immortal",
};

const FloatingFlame = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute text-accent/20 pointer-events-none ${className}`}
    animate={{ y: [0, -8, 0], opacity: [0.15, 0.3, 0.15], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <Flame className="h-6 w-6" />
  </motion.div>
);

const features = [
  { icon: Flame, label: "Streaks", sub: "50 XP/day", color: "text-orange-400", bg: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/20" },
  { icon: Star, label: "Levels", sub: "Unlock perks", color: "text-purple-400", bg: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/20" },
  { icon: Gift, label: "Rewards", sub: "Merch & more", color: "text-amber-400", bg: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/20" },
];

const GamificationWidget = () => {
  const { user } = useAuth();
  const { data: gam, checkStreak } = useGamification();
  const [streakChecked, setStreakChecked] = useState(false);

  useEffect(() => {
    if (user && !streakChecked) {
      setStreakChecked(true);
      checkStreak().then((result) => {
        if (result && result.xp_earned > 0) {
          toast.success(`🔥 Day ${result.current_streak} streak! +${result.xp_earned} XP`, {
            duration: 4000,
          });
        }
      });
    }
  }, [user, streakChecked]);

  if (!user || !gam) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="container mx-auto px-4 sm:px-6 py-10 sm:py-14"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-b from-card/80 via-card/60 to-background/90 backdrop-blur-xl">
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-accent/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-[20%] w-[300px] h-[150px] bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Floating flames */}
        <FloatingFlame className="bottom-8 left-[8%]" />
        <FloatingFlame className="top-12 right-[12%]" />
        <FloatingFlame className="bottom-16 right-[6%]" />

        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/[0.08] mb-6"
          >
            <Flame className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Rewards & XP</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
          >
            Earn, Streak,{" "}
            <span className="bg-gradient-to-r from-accent via-orange-400 to-accent bg-clip-text text-transparent">
              Redeem
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-muted-foreground text-sm sm:text-base max-w-lg mb-10 leading-relaxed"
          >
            Every action earns XP — daily streaks, club joins, connections.
            <br className="hidden sm:block" />
            Climb the leaderboard and unlock exclusive campus rewards.
          </motion.p>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl border ${f.border} bg-gradient-to-br ${f.bg} backdrop-blur-sm cursor-default`}
              >
                <div className={`h-9 w-9 rounded-xl bg-background/60 border border-border/20 flex items-center justify-center`}>
                  <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">{f.label}</p>
                  <p className="text-[11px] text-muted-foreground">{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <Link to="/gamification">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 40px hsl(var(--accent) / 0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base overflow-hidden transition-shadow"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.8), hsl(var(--primary) / 0.9))",
                  color: "hsl(var(--accent-foreground))",
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Flame className="h-4 w-4 relative z-10" />
                <span className="relative z-10">View Rewards Store</span>
                <ChevronRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Live stats row */}
          {gam.xp > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-border/20"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">{gam.xp}</span> XP earned
              </div>
              <div className="h-3 w-px bg-border/30" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="font-semibold text-foreground">{gam.currentStreak}</span> day streak
              </div>
              <div className="h-3 w-px bg-border/30" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-purple-400" />
                Level <span className="font-semibold text-foreground">{gam.level}</span>
                <span className="text-muted-foreground/60">
                  ({levelTitles[Math.min(gam.level, 10)] || "Immortal"})
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom edge glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>
    </motion.section>
  );
};

export default GamificationWidget;
