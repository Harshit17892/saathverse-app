import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { useDiscoverCarousel } from "@/hooks/use-supabase-data";

const categoryColors: Record<string, string> = {
  promotion: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  featured: "bg-primary/15 text-primary border-primary/30",
  event: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  announcement: "bg-accent/15 text-accent border-accent/30",
  trending: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  new: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  offer: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  sponsor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const DiscoverCarousel = () => {
  const { data: slides = [] } = useDiscoverCarousel();
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const rx = useTransform(sy, [-200, 200], [5, -5]);
  const ry = useTransform(sx, [-200, 200], [-5, 5]);

  const next = useCallback(() => {
    if (slides.length > 0) { setDir(1); setCurrent((p) => (p + 1) % slides.length); }
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 0) { setDir(-1); setCurrent((p) => (p - 1 + slides.length) % slides.length); }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };

  if (slides.length === 0) return null;

  const slide = slides[current] as any;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0, scale: 0.85, rotateY: d > 0 ? 30 : -30 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0 },
    exit: (d: number) => ({ x: d > 0 ? -400 : 400, opacity: 0, scale: 0.85, rotateY: d > 0 ? -30 : 30 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {/* Section header */}
      <div className="text-center mb-8">
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
          What's <span className="gradient-text">Happening</span>
        </h2>
      </div>

      {/* 3D Carousel */}
      <div
        ref={ref}
        onMouseMove={onMove}
        className="relative max-w-4xl mx-auto"
        style={{ perspective: "1200px" }}
      >
        <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30">
            {/* Top shimmer */}
            <motion.div
              className="absolute inset-x-0 top-0 h-px z-30"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), hsl(var(--accent)/0.6), transparent)" }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {/* Bottom shimmer */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-px z-30"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--accent)/0.4), hsl(var(--primary)/0.4), transparent)" }}
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-primary/20 rounded-tl-2xl z-20" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-accent/20 rounded-br-2xl z-20" />

            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={current}
                custom={dir}
                variants={variants}
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
                  <div className="relative h-[220px] sm:h-[320px] overflow-hidden rounded-2xl sm:rounded-3xl">
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
                        {/* Decorative orbitals */}
                        <motion.div
                          className="absolute top-8 right-8 w-32 h-32 rounded-full border border-foreground/5"
                          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute bottom-8 left-8 w-48 h-48 rounded-full border border-foreground/5"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl bg-foreground/5 backdrop-blur-sm"
                          animate={{ rotate: [0, 90, 180, 270, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.span
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`text-[10px] sm:text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${
                            categoryColors[slide.category] || categoryColors.featured
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

                      {slide.description && (
                        <motion.p
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.35 }}
                          className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg line-clamp-2"
                        >
                          {slide.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </a>
              </motion.div>
            </AnimatePresence>

            {/* Nav arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full glass border border-border/30 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full glass border border-border/30 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
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
                onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                className="relative"
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
                    layoutId="discover-dot"
                    className="absolute inset-0 rounded-full bg-primary/30 blur-sm"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DiscoverCarousel;
