import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { useSpotlightCarousel } from "@/hooks/use-supabase-data";

const categoryStyles: Record<string, string> = {
  featured: "bg-primary/15 text-primary border-primary/30",
  product: "bg-accent/15 text-accent border-accent/30",
  event: "bg-green-500/15 text-green-400 border-green-500/30",
  announcement: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  spotlight: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const SpotlightCarousel = () => {
  const { data: slides = [] } = useSpotlightCarousel();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const rotateX = useTransform(springY, [-200, 200], [4, -4]);
  const rotateY = useTransform(springX, [-200, 200], [-4, 4]);
  const glowX = useTransform(springX, [-200, 200], [20, 80]);
  const glowY = useTransform(springY, [-200, 200], [20, 80]);

  const next = useCallback(() => {
    if (slides.length > 0) {
      setDirection(1);
      setCurrent((p) => (p + 1) % slides.length);
    }
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 0) {
      setDirection(-1);
      setCurrent((p) => (p - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  if (slides.length === 0) return null;

  const slide = slides[current] as any;

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.88,
      rotateY: d > 0 ? 25 : -25,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.88,
      rotateY: d > 0 ? -25 : 25,
    }),
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent/3 blur-[180px]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-primary uppercase tracking-widest mb-5 border border-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Spotlight
          </motion.span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
            In the <span className="gradient-text">Spotlight</span>
          </h2>
        </motion.div>

        {/* 3D Carousel */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative max-w-4xl mx-auto"
          style={{ perspective: "1400px" }}
        >
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30">
              {/* Dynamic cursor glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20 opacity-30"
                style={{
                  background: useTransform(
                    [glowX, glowY],
                    ([x, y]) =>
                      `radial-gradient(circle 200px at ${x}% ${y}%, hsl(var(--primary)/0.15), transparent)`
                  ),
                }}
              />

              {/* Top edge shimmer */}
              <motion.div
                className="absolute inset-x-0 top-0 h-px z-30"
                style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), hsl(var(--accent)/0.6), transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <a
                    href={slide.hyperlink || "#"}
                    target={slide.hyperlink ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="relative h-[240px] sm:h-[340px] overflow-hidden rounded-2xl sm:rounded-3xl">
                      {slide.image_url ? (
                        <motion.img
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.8 }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${slide.gradient || "from-primary/20 to-accent/20"}`}>
                          {/* Abstract decorative shapes */}
                          <motion.div
                            className="absolute top-10 right-10 w-40 h-40 rounded-full border border-foreground/5"
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute bottom-10 left-10 w-60 h-60 rounded-full border border-foreground/5"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          />
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl bg-foreground/5 backdrop-blur-sm"
                            animate={{ rotate: [0, 90, 180, 270, 360] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.span
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`text-[10px] sm:text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${
                              categoryStyles[slide.category] || categoryStyles.featured
                            }`}
                          >
                            {slide.category || "featured"}
                          </motion.span>
                          {slide.hyperlink && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {slide.link_text || "Learn More"}
                            </motion.span>
                          )}
                        </div>

                        <motion.h3
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="font-display text-2xl sm:text-4xl font-bold text-foreground group-hover:text-primary transition-colors mb-1.5"
                        >
                          {slide.title}
                        </motion.h3>

                        {slide.subtitle && (
                          <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="text-sm sm:text-base font-medium text-primary/80"
                          >
                            {slide.subtitle}
                          </motion.p>
                        )}

                        {slide.description && (
                          <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-lg line-clamp-2"
                          >
                            {slide.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </a>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full glass border border-border/30 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all group"
                  >
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full glass border border-border/30 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all group"
                  >
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Progress dots */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className="relative group/dot"
                >
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-8 bg-gradient-to-r from-primary to-accent"
                        : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                    }`}
                  />
                  {i === current && (
                    <motion.div
                      layoutId="spotlight-dot"
                      className="absolute inset-0 rounded-full bg-primary/30 blur-sm"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpotlightCarousel;
