import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Rocket, Trophy, BookOpen, Lightbulb, Users,
  Palette, GraduationCap, Code2, Globe2, Megaphone, Zap, Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useCarouselSlides } from "@/hooks/use-supabase-data";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy, rocket: Rocket, book: BookOpen, lightbulb: Lightbulb,
  users: Users, palette: Palette, graduation: GraduationCap, code: Code2,
  globe: Globe2, megaphone: Megaphone, zap: Zap, star: Star,
};

const fallbackItems = [
  { title: "🚀 Platform Launch", desc: "SaathVerse is live! Connect with peers across your campus.", gradient: "from-accent/60 via-primary/40 to-accent/20", icon: "rocket", link: "", image: "" },
  { title: "🏆 Hackathon Season", desc: "Register for upcoming hackathons and build with the best teams.", gradient: "from-primary/60 via-accent/30 to-primary/20", icon: "trophy", link: "/hackathons", image: "" },
  { title: "💡 Startup Hub Open", desc: "Submit your startup ideas, get AI scores, and find co-founders.", gradient: "from-accent/50 via-primary/50 to-accent/30", icon: "lightbulb", link: "/startup", image: "" },
  { title: "🤝 Find Your Team", desc: "Discover students with matching skills for your next project.", gradient: "from-primary/50 via-accent/40 to-primary/30", icon: "users", link: "/discover", image: "" },
  { title: "📢 Campus Clubs", desc: "Join clubs, attend events, and grow your network.", gradient: "from-accent/40 via-primary/60 to-accent/20", icon: "megaphone", link: "/clubs", image: "" },
];

const ShowcaseCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: dbSlides = [] } = useCarouselSlides();

  const items = dbSlides.length > 0
    ? dbSlides.map((s: any) => ({
        title: s.title,
        desc: s.description || "",
        gradient: s.gradient || "from-accent/50 via-primary/40 to-accent/20",
        icon: s.icon || "rocket",
        link: s.link || "",
        image: s.image_url || "",
      }))
    : fallbackItems;

  const total = items.length;

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setActiveIndex((prev) => (prev + dir + total) % total);
  }, [total]);

  // Auto-play
  useEffect(() => {
    intervalRef.current = setInterval(() => go(1), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [go]);

  const resetAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => go(1), 5000);
  }, [go]);

  const handleNav = (dir: number) => {
    go(dir);
    resetAutoplay();
  };

  const handleDot = (i: number) => {
    setDirection(i > activeIndex ? 1 : -1);
    setActiveIndex(i);
    resetAutoplay();
  };

  const current = items[activeIndex];
  const IconComp = iconMap[current.icon] || Rocket;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -400 : 400, opacity: 0, scale: 0.9 }),
  };

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="showcase-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="0.5" fill="currentColor" className="text-foreground" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#showcase-grid)" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/[0.04] blur-[200px] rounded-full" />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-accent uppercase tracking-widest mb-4 border border-accent/20"
          >
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Megaphone className="h-3 w-3" />
            </motion.div>
            Live Feed
          </motion.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Spotlight <span className="gradient-text">& Buzz</span>
          </h2>
        </motion.div>

        {/* Main carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation arrows - desktop */}
          <button
            onClick={() => handleNav(-1)}
            className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass border border-border/30 items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => handleNav(1)}
            className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full glass border border-border/30 items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all group"
          >
            <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Card container */}
          <div className="relative h-[320px] sm:h-[360px] md:h-[400px] overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* Animated border */}
            <motion.div
              className="absolute -inset-[1px] rounded-3xl z-0"
              style={{
                background: "conic-gradient(from 0deg, hsl(var(--primary)/0.6), hsl(var(--accent)/0.8), transparent 40%, hsl(var(--primary)/0.3), hsl(var(--accent)/0.6))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner content */}
            <div className="absolute inset-[1px] rounded-3xl bg-card/95 backdrop-blur-xl z-10 overflow-hidden">
              {/* Full background image when available */}
              {current.image && (
                <div className="absolute inset-0 z-0">
                  <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/70 to-card/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-card/40" />
                </div>
              )}

              {/* Decorative mesh gradient (when no image) */}
              {!current.image && (
                <div className="absolute inset-0 opacity-30">
                  <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient}`} />
                  <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/10 blur-[100px] rounded-full" />
                  <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-primary/10 blur-[80px] rounded-full" />
                </div>
              )}

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-accent/30"
                  style={{ top: `${15 + Math.random() * 70}%`, left: `${10 + Math.random() * 80}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}

              {/* Slide content */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 flex flex-col items-start justify-end px-6 sm:px-12 md:px-16 pb-10 sm:pb-14 z-10"
                >
                  {/* Icon badge (only when no image) */}
                  {!current.image && (
                    <div className="relative mb-4 flex-shrink-0">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 rounded-full border border-dashed border-accent/20"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center relative"
                        style={{
                          background: "linear-gradient(135deg, hsl(var(--accent)/0.2), hsl(var(--primary)/0.15))",
                          boxShadow: "0 0 40px hsl(var(--accent)/0.15), inset 0 1px 0 hsl(var(--foreground)/0.05)",
                        }}
                      >
                        <div className="absolute inset-[1px] rounded-2xl bg-card/60 backdrop-blur-sm" />
                        <IconComp className="h-6 w-6 sm:h-8 sm:w-8 text-accent relative z-10" />
                      </motion.div>
                      <div className="absolute -inset-2 bg-accent/10 blur-xl rounded-full -z-10" />
                    </div>
                  )}

                  {/* Text */}
                  <div className="max-w-lg">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3 drop-shadow-lg"
                    >
                      {current.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-foreground/80 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5 drop-shadow-md"
                    >
                      {current.desc}
                    </motion.p>
                    {current.link && (
                      <motion.a
                        href={current.link}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-accent-foreground transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
                      >
                        Learn More <ArrowRight className="h-3.5 w-3.5" />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/20 z-20">
                <motion.div
                  key={activeIndex}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
            </div>
          </div>

          {/* Slide counter + dots */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* Mobile arrows */}
            <button onClick={() => handleNav(-1)} className="md:hidden h-9 w-9 rounded-full glass border border-border/30 flex items-center justify-center text-muted-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {items.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      width: i === activeIndex ? 28 : 8,
                      backgroundColor: i === activeIndex ? "hsl(var(--accent))" : "hsl(var(--muted-foreground)/0.25)",
                    }}
                    className="h-2 rounded-full transition-colors"
                  />
                  {i === activeIndex && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute inset-0 rounded-full bg-accent/30 blur-sm"
                    />
                  )}
                </button>
              ))}
            </div>

            <button onClick={() => handleNav(1)} className="md:hidden h-9 w-9 rounded-full glass border border-border/30 flex items-center justify-center text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Slide count text */}
          <p className="text-center text-[11px] text-muted-foreground/60 mt-2 font-mono">
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>

        {/* Quick steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12 mt-10 sm:mt-14">
          {[
            { num: "01", label: "Discover & Connect" },
            { num: "02", label: "Form Teams" },
            { num: "03", label: "Build & Ship" },
            { num: "04", label: "Grow Together" },
          ].map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="text-center group cursor-pointer">
              <span className="font-display font-bold text-base sm:text-lg gradient-text">#{step.num}</span>
              <p className="text-foreground/70 text-xs sm:text-sm mt-1 font-medium group-hover:text-foreground transition-colors">{step.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseCarousel;
