import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import saathverseLogo from "@/assets/saathverse-logo-new.png";

/* ── Starfield background ── */
const Starfield = () => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-primary/40"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.4, 1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
};

/* ── Animated counter ── */
const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / 125;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

/* ── Glowing ring around logo ── */
const GlowRing = () => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{
      background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)/0.2), hsl(var(--accent)), hsl(var(--primary)))",
      padding: 2,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  >
    <div className="w-full h-full rounded-full bg-background" />
  </motion.div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Deep space background */}
      <div className="absolute inset-0 bg-background" />
      <Starfield />

      {/* Central radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[900px] sm:h-[900px] rounded-full bg-primary/6 blur-[180px]" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[400px] rounded-full bg-accent/4 blur-[150px]" />

      {/* Gradient line accent (like ExamAI) */}
      <motion.div
        className="absolute top-[62%] sm:top-[58%] left-[10%] right-[10%] h-[2px] rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--accent)), transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
      />

      {/* Scattered glow dots */}
      {[
        { x: "15%", y: "20%", color: "primary" },
        { x: "80%", y: "25%", color: "accent" },
        { x: "10%", y: "75%", color: "accent" },
        { x: "85%", y: "70%", color: "primary" },
        { x: "50%", y: "15%", color: "primary" },
        { x: "30%", y: "85%", color: "accent" },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full bg-${dot.color}/60 hidden sm:block`}
          style={{ left: dot.x, top: dot.y }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-3xl mx-auto"
      >
        {/* Logo with glow ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 1, delay: 0.2 }}
          className="relative mb-4 sm:mb-6"
        >
          <div className="relative w-20 h-20 sm:w-28 sm:h-28">
            <GlowRing />
            <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center overflow-hidden">
              <img src={saathverseLogo} alt="SaathVerse" className="w-12 h-12 sm:w-18 sm:h-18 object-contain" />
            </div>
          </div>
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-[40px] -z-10" />
        </motion.div>

        {/* Brand name beside logo feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mb-6 sm:mb-8"
        >
          <span className="font-display text-3xl sm:text-5xl font-bold text-foreground">Saath</span>
          <span className="font-display text-3xl sm:text-5xl font-bold gradient-text">Verse</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-4 sm:mb-6"
        >
          Your Campus,{" "}
          <span className="relative inline-block">
            <span className="gradient-text">Supercharged</span>
          </span>
        </motion.h1>

        {/* Live badge — ExamAI style */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="inline-flex items-center gap-2 sm:gap-3 glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 mb-6 sm:mb-8 border border-primary/20"
        >
          <span className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-accent tracking-wider uppercase">
            <motion.span
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-accent"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE
          </span>
          <div className="w-px h-5 bg-border" />
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 40}`}
                alt=""
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 border-background ring-1 ring-primary/20"
              />
            ))}
          </div>
          <div className="text-left">
            <div className="text-sm sm:text-base font-bold text-foreground">
              <AnimatedCounter target={2400} suffix=" +" />
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
              Students Active
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed"
        >
          Search students, form hackathon teams, launch startups with AI scoring, 
          join clubs, connect with alumni — all in one secure platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="group relative flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base overflow-hidden w-full sm:w-auto justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <span className="relative flex items-center gap-2">
              Sign Up Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 glow-primary opacity-40" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 glass px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-foreground border border-border/50 hover:border-primary/40 transition-all w-full sm:w-auto justify-center"
          >
            <Lock className="h-5 w-5 text-accent" />
            Log In
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center pt-1.5">
          <motion.div
            className="w-1 h-2 rounded-full bg-accent"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
