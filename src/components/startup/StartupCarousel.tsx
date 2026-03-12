import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Rocket, Sparkles } from "lucide-react";
import { useStartupCarousel } from "@/hooks/use-supabase-data";

const categoryColors: Record<string, string> = {
  featured: "bg-primary/20 text-primary border-primary/30",
  challenge: "bg-accent/20 text-accent border-accent/30",
  event: "bg-green-500/15 text-green-400 border-green-500/30",
  announcement: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  trending: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const StartupCarousel = () => {
  const { data: slides = [] } = useStartupCarousel();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    if (slides.length > 0) setCurrent((p) => (p + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 0) setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length, isHovered]);

  if (slides.length === 0) return null;

  const slide = slides[current] as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/30" style={{ perspective: "1400px" }}>
        {/* Layered glass edges — curved window effect */}
        <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-accent/8" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
          {/* Corner glow effects */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl" />
        </div>

        {/* Reflective strip at top */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-10 rounded-t-2xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, rotateY: 12, scale: 0.94, x: 40 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, rotateY: -12, scale: 0.94, x: -40 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            <a
              href={slide.hyperlink || "#"}
              target={slide.hyperlink ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative h-[200px] md:h-[300px] overflow-hidden rounded-2xl">
                {slide.image_url ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-card to-accent/20 relative">
                    {/* Animated neural background for slides without images */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 800 400">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.line key={i}
                          x1={Math.random() * 800} y1={Math.random() * 400}
                          x2={Math.random() * 800} y2={Math.random() * 400}
                          stroke="hsl(263 70% 58%)" strokeWidth="1"
                          initial={{ opacity: 0.1 }}
                          animate={{ opacity: [0.1, 0.4, 0.1] }}
                          transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                        />
                      ))}
                    </svg>
                    {/* Large icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="p-6 rounded-3xl bg-primary/10 border border-primary/20"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <Rocket className="h-12 w-12 text-primary/40" />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Multi-layer overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${categoryColors[slide.category] || categoryColors.featured}`}>
                      {slide.category || "featured"}
                    </span>
                    {slide.hyperlink && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                        className="text-[10px] text-muted-foreground flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> {slide.link_text || "Learn More"}
                      </motion.span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {slide.title}
                  </h3>
                  {slide.description && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-lg line-clamp-2">{slide.description}</p>
                  )}
                </div>

                {/* Floating sparkle effect on hover */}
                <motion.div
                  className="absolute top-6 right-6 pointer-events-none"
                  animate={{ opacity: isHovered ? 1 : 0, rotate: isHovered ? 45 : 0, scale: isHovered ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles className="h-6 w-6 text-accent/60" />
                </motion.div>
              </div>
            </a>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors border border-border/30 hover:border-primary/30 shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors border border-border/30 hover:border-primary/30 shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </>
        )}

        {/* Animated dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 px-3 py-1.5 rounded-full glass border border-border/20">
            {slides.map((_: any, i: number) => (
              <motion.button
                key={i}
                onClick={() => setCurrent(i)}
                className="relative h-2 rounded-full transition-all overflow-hidden"
                animate={{ width: i === current ? 24 : 8 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`absolute inset-0 rounded-full ${i === current ? "bg-gradient-to-r from-primary to-accent" : "bg-muted-foreground/30"}`} />
                {i === current && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 5, ease: "linear" }}
                    key={`progress-${current}`}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Slide counter */}
        {slides.length > 1 && (
          <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-lg glass border border-border/20 text-[10px] text-muted-foreground font-medium">
            {current + 1} / {slides.length}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StartupCarousel;
