import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Zap, Globe2, Users, Rocket } from "lucide-react";

const HexGrid = () => {
  const hexes: { x: number; y: number; delay: number }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 14; col++) {
      const offset = row % 2 === 0 ? 0 : 30;
      hexes.push({ x: col * 60 + offset, y: row * 52, delay: Math.random() * 3 });
    }
  }
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 840 420" preserveAspectRatio="xMidYMid slice">
      {hexes.map((h, i) => (
        <motion.polygon
          key={i}
          points="30,0 60,15 60,45 30,60 0,45 0,15"
          transform={`translate(${h.x},${h.y})`}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 4, delay: h.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
};

const FloatingNode = ({ x, y, size, delay, label, icon: Icon }: {
  x: string; y: string; size: number; delay: number; label: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <motion.div
    className="absolute group cursor-pointer"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay + 0.5, type: "spring", stiffness: 100 }}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute -inset-3 rounded-full border border-accent/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, delay, repeat: Infinity }}
      />
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-full bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Node */}
      <motion.div
        whileHover={{ scale: 1.3, rotate: 10 }}
        className="relative flex items-center justify-center rounded-xl border border-accent/30 backdrop-blur-md"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, hsl(var(--accent)/0.15), hsl(var(--primary)/0.1))",
          boxShadow: "0 0 30px hsl(var(--accent)/0.1), inset 0 1px 0 hsl(var(--foreground)/0.05)",
        }}
      >
        <Icon className={`text-accent h-5 w-5`} />
      </motion.div>
      {/* Label */}
      <motion.span
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-accent/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {label}
      </motion.span>
    </motion.div>
  </motion.div>
);

const ConnectionLine = ({ x1, y1, x2, y2, delay }: {
  x1: string; y1: string; x2: string; y2: string; delay: number;
}) => (
  <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="hsl(var(--accent))"
      strokeWidth="1"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.15 }}
      transition={{ duration: 2, delay }}
    />
    {/* Traveling dot */}
    <motion.circle
      r="2"
      fill="hsl(var(--accent))"
      initial={{ opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 0.8, 0],
      }}
      transition={{ duration: 3, delay: delay + 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.svg>
);

const ParticleField = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
  }));

  return (
    <>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
};

const DiscoverHeroBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const rotateX = useTransform(smoothY, [-200, 200], [3, -3]);
  const rotateY = useTransform(smoothX, [-200, 200], [-3, 3]);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden py-8 sm:py-12"
      style={{ perspective: "1200px" }}
    >
      {/* Background layers */}
      <HexGrid />
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* 3D tilting container */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="container mx-auto px-4 sm:px-6 relative z-10"
      >
        {/* Central orb */}
        <div className="relative h-[220px] sm:h-[260px] flex items-center justify-center">
          {/* Orbital rings */}
          {[180, 240, 300].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border"
              style={{
                width: size,
                height: size,
                borderColor: `hsl(var(--accent) / ${0.08 + i * 0.04})`,
                transform: `rotateX(${60 + i * 5}deg)`,
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 12 + i * 4,
                repeat: Infinity,
                ease: "linear",
                ...(i % 2 !== 0 ? { repeatType: "reverse" as const } : {}),
              }}
            />
          ))}

          {/* Central element */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
            className="relative z-10"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-2xl"
              style={{ background: "conic-gradient(from 0deg, hsl(var(--accent)), hsl(var(--primary)), transparent, hsl(var(--accent)))" }}
            />
            <div
              className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl flex items-center justify-center backdrop-blur-xl"
              style={{ background: "linear-gradient(135deg, hsl(var(--card)/0.9), hsl(var(--card)/0.7))" }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Globe2 className="h-10 w-10 sm:h-12 sm:w-12 text-accent" />
              </motion.div>
            </div>
            {/* Glow */}
            <div className="absolute -inset-6 bg-accent/15 blur-3xl rounded-full -z-10" />
          </motion.div>

          {/* Floating nodes */}
          <FloatingNode x="8%" y="20%" size={44} delay={0} label="Connect" icon={Users} />
          <FloatingNode x="82%" y="15%" size={40} delay={0.3} label="Innovate" icon={Rocket} />
          <FloatingNode x="75%" y="70%" size={38} delay={0.6} label="Build" icon={Zap} />
          <FloatingNode x="15%" y="72%" size={42} delay={0.9} label="Discover" icon={Globe2} />

          {/* Connection lines */}
          <ConnectionLine x1="12%" y1="35%" x2="45%" y2="50%" delay={0.5} />
          <ConnectionLine x1="85%" y1="30%" x2="55%" y2="50%" delay={0.8} />
          <ConnectionLine x1="78%" y1="80%" x2="55%" y2="55%" delay={1.1} />
          <ConnectionLine x1="18%" y1="82%" x2="45%" y2="55%" delay={1.4} />
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-2"
        >
          {[
            { label: "Campus Time", value: time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), color: "text-accent" },
            { label: "Status", value: "🟢 Online", color: "text-primary" },
            { label: "Network", value: "Multi-Tenant", color: "text-accent" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 + i * 0.15 }}
              className="text-center group cursor-default"
            >
              <motion.p
                className={`font-display text-xl sm:text-2xl font-bold ${stat.color}`}
                whileHover={{ scale: 1.1 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider mt-0.5 group-hover:text-muted-foreground transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DiscoverHeroBanner;
