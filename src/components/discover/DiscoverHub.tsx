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
        <div className="space-y-8 sm:space-y-10">
          {/* Campus Clubs Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-card/40 backdrop-blur-xl p-6 sm:p-10 lg:p-12">
              <motion.div
                animate={{ x: [0, 60, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-[120px]"
              />
              <motion.div
                animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-[140px]"
              />

              <div className="absolute inset-0 opacity-[0.05]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="clubs-web3-grid-v2" width="54" height="46.8" patternUnits="userSpaceOnUse">
                      <polygon points="27,0 54,15.6 54,46.8 27,31.2 0,46.8 0,15.6" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#clubs-web3-grid-v2)" />
                </svg>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
                <div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.08 }}
                    className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/30 flex items-center justify-center mb-6"
                  >
                    <Layers className="h-7 w-7 text-primary" />
                  </motion.div>

                  <h3 className="font-display text-3xl sm:text-4xl md:text-[2.8rem] font-bold text-foreground mb-4 leading-tight">
                    Campus Clubs, <span className="text-primary">Reimagined</span>
                  </h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6 max-w-xl">
                    Discover active communities, live events, and creator circles through a high-energy club ecosystem built for students.
                  </p>

                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {["120+ Active Clubs", "Weekly Events", "Creator Communities"].map((chip, i) => (
                      <motion.span
                        key={chip}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 + i * 0.08 }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/25 bg-primary/10 text-primary"
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </div>

                  <Link to="/clubs">
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 0 42px hsl(var(--primary) / 0.45)" }}
                      whileTap={{ scale: 0.96 }}
                      className="relative overflow-hidden px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground group/btn border border-primary/30"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        animate={{ x: ["-100%", "220%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.3 }}
                      />
                      <span className="relative flex items-center gap-2.5">
                        <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                        Explore Campus Clubs
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                </div>

                <div className="relative h-[230px] sm:h-[260px] lg:h-[280px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    className="absolute right-3 top-2 h-40 w-40 rounded-full border border-primary/20"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    className="absolute right-10 top-9 h-26 w-26 rounded-full border border-accent/20"
                  />

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 top-6 rounded-2xl border border-primary/25 bg-background/50 backdrop-blur-md px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-primary/80">Live Now</p>
                    <p className="text-sm font-semibold text-foreground">Design Society Meetup</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    className="absolute left-10 bottom-7 rounded-2xl border border-accent/25 bg-background/50 backdrop-blur-md px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-accent/80">Trending</p>
                    <p className="text-sm font-semibold text-foreground">Film & Media Collective</p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute right-2 bottom-3 rounded-2xl border border-primary/25 bg-background/50 backdrop-blur-md px-4 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-primary/80">Members</p>
                    <p className="text-sm font-semibold text-foreground">2,840+ students</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* IEEE Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-blue-400/30 bg-card/40 backdrop-blur-xl p-6 sm:p-10 lg:p-12">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.08, 0.18, 0.08] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 right-10 w-96 h-96 rounded-full bg-blue-500/10 blur-[130px]"
              />

              <div className="absolute inset-0 opacity-[0.06]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="ieee-web3-circuit" width="52" height="52" patternUnits="userSpaceOnUse">
                      <circle cx="26" cy="26" r="2" fill="currentColor" className="text-blue-400" />
                      <path d="M26 0 V26 M0 26 H26 M26 26 H52 M26 26 V52" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-blue-400" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ieee-web3-circuit)" />
                </svg>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-10 items-center">
                <div>
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.08 }}
                    className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/25 to-blue-500/5 border border-blue-400/30 flex items-center justify-center mb-6"
                  >
                    <Radio className="h-7 w-7 text-blue-400" />
                  </motion.div>

                  <h3 className="font-display text-3xl sm:text-4xl md:text-[2.8rem] font-bold text-foreground mb-4 leading-tight">
                    IEEE, <span className="text-blue-400">Future-Ready Network</span>
                  </h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6 max-w-xl">
                    Join a high-signal ecosystem of workshops, research circles, conference prep, and mentorship that accelerates your engineering trajectory.
                  </p>

                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {["Research Pods", "Weekly Workshops", "Industry Connect"].map((chip, i) => (
                      <motion.span
                        key={chip}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 + i * 0.08 }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-400/30 bg-blue-500/10 text-blue-300"
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </div>

                  <Link to="/ieee">
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 0 42px rgba(96, 165, 250, 0.45)" }}
                      whileTap={{ scale: 0.96 }}
                      className="relative overflow-hidden px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-500 via-sky-500 to-blue-400 text-white group/btn border border-blue-400/40"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                        animate={{ x: ["-100%", "220%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                      />
                      <span className="relative flex items-center gap-2.5">
                        <Radio className="h-4 w-4 sm:h-5 sm:w-5" />
                        Explore IEEE Chapter
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                </div>

                <div className="relative h-[230px] sm:h-[260px] lg:h-[280px]">
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-8 top-4 h-2 w-2 rounded-full bg-blue-400"
                  />
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    className="absolute right-20 top-16 h-1.5 w-1.5 rounded-full bg-sky-300"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="absolute right-12 bottom-20 h-2 w-2 rounded-full bg-blue-300"
                  />

                  <div className="absolute left-0 right-0 top-6 bottom-6 rounded-2xl border border-blue-400/20 bg-background/30 backdrop-blur-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-blue-300/80">Signal Board</span>
                      <span className="text-[10px] text-blue-300">Live</span>
                    </div>

                    <div className="space-y-3">
                      {[72, 54, 88, 61].map((v, i) => (
                        <div key={v + i} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-8">N{i + 1}</span>
                          <div className="h-2 flex-1 rounded-full bg-blue-950/40 overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              whileInView={{ width: `${v}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, delay: 0.15 + i * 0.12 }}
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      className="mt-4 rounded-xl border border-blue-400/25 bg-blue-500/10 px-3 py-2"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-blue-300/80">Upcoming</p>
                      <p className="text-sm font-semibold text-foreground">IEEE Research Sprint</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverHub;
