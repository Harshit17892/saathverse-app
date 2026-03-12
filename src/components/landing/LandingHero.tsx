import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import saathverseLogo from "@/assets/saathverse-logo-new.png";

/* ── Floating particles with 3D depth ── */
const Particles3D = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1000px" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? "hsl(var(--primary)/0.6)"
              : p.id % 3 === 1
              ? "hsl(var(--accent)/0.5)"
              : "hsl(var(--foreground)/0.2)",
            transformStyle: "preserve-3d",
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.id % 2 === 0 ? 15 : -15, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ── Animated word rotator with 3D flip ── */
const words = ["Hackathons", "Startups", "Clubs", "Research", "Alumni"];
const WordRotator3D = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block w-[240px] sm:w-[340px] h-[1.15em] overflow-hidden align-bottom" style={{ perspective: "600px" }}>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="absolute left-0 gradient-text font-bold"
          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{
            rotateX: i === index ? 0 : -90,
            opacity: i === index ? 1 : 0,
            y: i === index ? 0 : -20,
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

/* ── Orbital ring around logo ── */
const OrbitalRing = ({ size, duration, delay, color }: { size: number; duration: number; delay: number; color: string }) => (
  <motion.div
    className="absolute rounded-full border"
    style={{
      width: size,
      height: size,
      top: "50%",
      left: "50%",
      marginTop: -size / 2,
      marginLeft: -size / 2,
      borderColor: `hsl(var(--${color})/0.3)`,
      transformStyle: "preserve-3d",
    }}
    animate={{ rotate: 360, rotateX: [0, 15, 0, -15, 0] }}
    transition={{ rotate: { duration, repeat: Infinity, ease: "linear" }, rotateX: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut" } }}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
  >
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ background: `hsl(var(--${color}))`, top: -4, left: "50%", marginLeft: -4, boxShadow: `0 0 12px hsl(var(--${color})/0.8)` }}
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    />
  </motion.div>
);

const LandingHero = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <Particles3D />

      {/* Deep radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[1000px] sm:h-[1000px] rounded-full bg-primary/[0.04] blur-[200px]" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-accent/[0.03] blur-[150px]" />

      {/* Animated gradient border at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 30%, hsl(var(--accent)) 70%, transparent 100%)" }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl mx-auto"
      >
        {/* 3D Logo with orbital rings */}
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", duration: 1.5, delay: 0.2 }}
          className="relative mb-8 sm:mb-10"
          style={{ perspective: "800px" }}
        >
          <div className="relative w-28 h-28 sm:w-36 sm:h-36" style={{ transformStyle: "preserve-3d" }}>
            {/* Orbital rings */}
            <OrbitalRing size={160} duration={8} delay={0} color="primary" />
            <OrbitalRing size={200} duration={12} delay={1} color="accent" />
            <OrbitalRing size={240} duration={16} delay={2} color="primary" />

            {/* Spinning glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), transparent 40%, hsl(var(--primary)))",
                padding: 3,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-background" />
            </motion.div>

            {/* Black circle center */}
            <div className="absolute inset-[4px] rounded-full bg-background border border-border/30" />
          </div>

          {/* Glow behind logo */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-[60px] -z-10" />
          <motion.div
            className="absolute inset-[-10px] rounded-full border border-primary/10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* Brand name — BIG and BOLD */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-6 sm:mb-8"
          style={{ perspective: "600px" }}
        >
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight">
            <span className="text-foreground">Saath</span>
            <span className="gradient-text">Verse</span>
          </h2>
        </motion.div>

        {/* Main headline with 3D word rotator */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="font-display text-2xl sm:text-4xl md:text-5xl font-semibold text-foreground/90 leading-[1.2] mb-4 sm:mb-6"
        >
          One Platform for{" "}
          <WordRotator3D />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm sm:text-lg text-muted-foreground max-w-2xl mb-10 sm:mb-12 leading-relaxed"
        >
          Search students, form hackathon teams, launch startups with AI scoring,
          join clubs, connect with alumni — all in one verified, secure platform.
        </motion.p>

        {/* CTA Buttons with 3D hover */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          style={{ perspective: "600px" }}
        >
          <motion.button
            whileHover={{ scale: 1.06, rotateX: -3, rotateY: 3, boxShadow: "0 20px 60px -15px hsl(var(--primary)/0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="group relative flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg w-full sm:w-auto justify-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              color: "hsl(var(--primary-foreground))",
              transformStyle: "preserve-3d",
            }}
          >
            <Sparkles className="h-5 w-5" />
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06, rotateX: -2, rotateY: -2, borderColor: "hsl(var(--primary)/0.6)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg text-foreground border border-border/50 bg-card/20 backdrop-blur-sm transition-all w-full sm:w-auto justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Lock className="h-5 w-5 text-accent" />
            Log In
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Explore</span>
        <div className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center pt-1.5">
          <motion.div className="w-1 h-2 rounded-full bg-accent" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </motion.div>
    </section>
  );
};

export default LandingHero;
