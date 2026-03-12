import { motion } from "framer-motion";
import { Rocket, Trophy, Zap, Layers, Radio, Flame, ChevronRight, Star, Gift, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import DiscoverCarousel from "./DiscoverCarousel";

const floatingParticle = (delay: number, x: number, y: number) => ({
  initial: { opacity: 0, x, y, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    x: [x, x + 20, x - 10],
    y: [y, y - 40, y - 80],
    scale: [0, 1, 0.5],
    transition: { duration: 3, delay, repeat: Infinity, ease: "easeOut" as const },
  },
});

const DiscoverHub = () => {
  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hub-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hub-grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 space-y-16 sm:space-y-24">

        {/* ═══════════ HACKATHONS & STARTUPS CTA ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl p-8 sm:p-12 lg:p-16">
            {/* Animated gradient orbs */}
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-[100px]"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1.2, 1, 1.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-[120px]"
            />

            {/* Floating particles */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={`p1-${i}`}
                {...floatingParticle(i * 0.6, 50 + i * 80, 20 + i * 30)}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
              />
            ))}

            {/* Orbiting ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.06]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border border-primary"
              />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-accent uppercase tracking-widest mb-6 border border-accent/20"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Build & Compete
                </motion.div>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Launch Ideas, <span className="gradient-text">Win Prizes</span>
                </h2>
                <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed mb-8">
                  Join hackathons, pitch startup ideas, find co-founders, and compete for prizes. Your next big thing starts here.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link to="/hackathons">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground group/btn"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                      />
                      <span className="relative flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Explore Hackathons
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                  <Link to="/startup">
                    <motion.button
                      whileHover={{ scale: 1.05, borderColor: "hsl(var(--accent))" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 rounded-2xl font-bold text-sm border border-accent/30 text-accent hover:bg-accent/5 transition-all flex items-center gap-2 group/btn"
                    >
                      <Rocket className="h-4 w-4" />
                      Launch a Startup
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </div>

              {/* 3D Floating icons */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0" style={{ perspective: "600px" }}>
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {[
                    { Icon: Trophy, color: "text-primary", bg: "from-primary/20 to-primary/5", pos: "top-0 left-1/2 -translate-x-1/2" },
                    { Icon: Rocket, color: "text-accent", bg: "from-accent/20 to-accent/5", pos: "bottom-0 left-1/2 -translate-x-1/2" },
                    { Icon: Zap, color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-500/5", pos: "top-1/2 left-0 -translate-y-1/2" },
                    { Icon: Sparkles, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5", pos: "top-1/2 right-0 -translate-y-1/2" },
                  ].map(({ Icon, color, bg, pos }, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      className={`absolute ${pos} h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br ${bg} backdrop-blur-sm border border-border/30 flex items-center justify-center ${color}`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ DISCOVER CAROUSEL ═══════════ */}
        <DiscoverCarousel />

        {/* ═══════════ GAMIFICATION CTA ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-3xl border border-orange-400/20 bg-card/40 backdrop-blur-xl p-8 sm:p-12 lg:p-16">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/10 blur-[100px]"
            />

            {/* Streak flames */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`flame-${i}`}
                animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                className="absolute"
                style={{ left: `${20 + i * 30}%`, bottom: "10%" }}
              >
                <Flame className="h-6 w-6 text-orange-400/30" />
              </motion.div>
            ))}

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-orange-400 uppercase tracking-widest mb-6 border border-orange-400/20"
              >
                <Flame className="h-3.5 w-3.5" />
                Rewards & XP
              </motion.div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Earn, Streak, <span className="gradient-text">Redeem</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
                Every action earns XP — daily streaks, club joins, connections. Climb the leaderboard and unlock exclusive campus rewards.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                {[
                  { icon: Flame, label: "Streaks", value: "50 XP/day", color: "text-orange-400 border-orange-400/20 bg-orange-400/5" },
                  { icon: Star, label: "Levels", value: "Unlock perks", color: "text-primary border-primary/20 bg-primary/5" },
                  { icon: Gift, label: "Rewards", value: "Merch & more", color: "text-accent border-accent/20 bg-accent/5" },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${color} backdrop-blur-sm`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link to="/gamification">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 35px rgba(251, 146, 60, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white group/btn"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    View Rewards Store
                    <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ CLUBS & IEEE CTAs ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clubs CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-xl p-8 sm:p-10 h-full group">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-primary/10"
              />
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full border border-primary/5"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-primary/10 blur-[80px]"
              />

              {/* Hex pattern */}
              <div className="absolute inset-0 opacity-[0.03]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hex" width="50" height="43.3" patternUnits="userSpaceOnUse">
                      <polygon points="25,0 50,14.4 50,43.3 25,28.9 0,43.3 0,14.4" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hex)" />
                </svg>
              </div>

              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6"
                >
                  <Layers className="h-7 w-7 text-primary" />
                </motion.div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  Campus <span className="text-primary">Clubs</span>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                  Discover societies, join communities, attend events, and find your tribe on campus.
                </p>

                <Link to="/clubs">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px hsl(var(--primary) / 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground group/btn"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                    />
                    <span className="relative flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Explore Clubs
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* IEEE CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-card/40 backdrop-blur-xl p-8 sm:p-10 h-full group">
              {/* Circuit pattern */}
              <div className="absolute inset-0 opacity-[0.04]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="circuit2" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="2" fill="currentColor" className="text-blue-400" />
                      <path d="M20 0 V20 M0 20 H20 M20 20 L40 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#circuit2)" />
                </svg>
              </div>

              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px]"
              />

              {/* Pulsing signal rings */}
              <div className="absolute top-8 right-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                    transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                    className="absolute inset-0 w-8 h-8 rounded-full border border-blue-400/30"
                  />
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center mb-6"
                >
                  <Radio className="h-7 w-7 text-blue-400" />
                </motion.div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  IEEE <span className="text-blue-400">Chapter</span>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                  Research papers, technical workshops, conferences, and industry networking — level up professionally.
                </p>

                <Link to="/ieee">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(96, 165, 250, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-400 text-white group/btn"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }}
                    />
                    <span className="relative flex items-center gap-2">
                      <Radio className="h-4 w-4" />
                      Explore IEEE
                      <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverHub;
