import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Activity, MessageCircle, Trophy, Users, BookOpen, Zap } from "lucide-react";

const pulseEvents = [
  { icon: Trophy, text: "Rishabh solved 50 LeetCode problems this week", time: "2m ago", accent: "text-accent" },
  { icon: MessageCircle, text: "New discussion: 'Best resources for System Design'", time: "5m ago", accent: "text-primary" },
  { icon: Users, text: "3 new students joined Engineering & Technology", time: "12m ago", accent: "text-emerald-400" },
  { icon: BookOpen, text: "Harshit shared notes on Advanced Algorithms", time: "18m ago", accent: "text-cyan-400" },
  { icon: Zap, text: "Priya published a new ML research paper", time: "25m ago", accent: "text-pink-400" },
  { icon: Trophy, text: "Arjun's startup got accepted into incubator", time: "30m ago", accent: "text-accent" },
  { icon: MessageCircle, text: "Study group forming for Cloud Computing exam", time: "45m ago", accent: "text-primary" },
  { icon: Users, text: "Sneha connected with 5 alumni this week", time: "1h ago", accent: "text-emerald-400" },
];

const LivePulse = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/30 glass">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />

      <div className="relative px-6 pt-5 pb-3 flex items-center gap-2">
        <div className="relative">
          <Activity className="w-4 h-4 text-emerald-400" />
          <motion.div
            animate={{ scale: pulse ? [1, 1.8] : 1, opacity: pulse ? [1, 0] : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 rounded-full bg-emerald-400/40"
          />
        </div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Pulse</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Real-time activity</span>
        </div>
      </div>

      <div className="relative px-6 pb-5 space-y-1">
        <AnimatePresence>
          {pulseEvents.slice(0, visibleCount).map((event, i) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 group"
              >
                {/* Timeline dot */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-border/30 group-hover:border-primary/30 transition-colors`}>
                    <Icon className={`w-3.5 h-3.5 ${event.accent}`} />
                  </div>
                  {i < visibleCount - 1 && (
                    <div className="w-px h-full bg-border/30 absolute top-8 left-1/2 -translate-x-1/2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 truncate">{event.text}</p>
                  <span className="text-[10px] text-muted-foreground">{event.time}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {visibleCount < pulseEvents.length && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisibleCount(pulseEvents.length)}
            className="w-full py-2 mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/5"
          >
            Show {pulseEvents.length - visibleCount} more activities
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default LivePulse;
