import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useIEEECarousel } from "@/hooks/use-supabase-data";

const categoryColors: Record<string, string> = {
  "must-do": "bg-accent/20 text-accent border-accent/30",
  upcoming: "bg-green-500/15 text-green-400 border-green-500/30",
  featured: "bg-primary/20 text-primary border-primary/30",
  trending: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  new: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const IEEECarousel = () => {
  const { data: slides = [] } = useIEEECarousel();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    if (slides.length > 0) setCurrent((p) => (p + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 0) setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current] as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-10"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/30" style={{ perspective: "1200px" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none z-10 rounded-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, rotateY: 8, scale: 0.96 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -8, scale: 0.96 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
          >
            <a
              href={slide.hyperlink || "#"}
              target={slide.hyperlink ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative h-[220px] md:h-[280px] overflow-hidden rounded-2xl">
                {slide.image_url ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-card to-accent/20" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${categoryColors[slide.category] || categoryColors.upcoming}`}>
                      {slide.category || "upcoming"}
                    </span>
                    {slide.hyperlink && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" /> {slide.link_text || "Visit"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {slide.title}
                  </h3>
                </div>
              </div>
            </a>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default IEEECarousel;
