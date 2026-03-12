import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield, Lock, EyeOff, UserCheck, Brain, Users, Award } from "lucide-react";
import { useRef, MouseEvent } from "react";

const safetyFeatures = [
  { icon: Lock, title: "Private Chats", desc: "End-to-end secure messaging between students", color: "primary" },
  { icon: EyeOff, title: "Photo Privacy", desc: "Girls can hide profile photos for extra safety", color: "accent" },
  { icon: UserCheck, title: "Verified Campus", desc: "College email verification — no outsiders", color: "primary" },
  { icon: Brain, title: "AI Scoring", desc: "Get your startup scored before pitching", color: "accent" },
  { icon: Shield, title: "Safe Teams", desc: "Form teams with verified students only", color: "primary" },
  { icon: Award, title: "Research Hub", desc: "Find conferences & papers within campus", color: "accent" },
];

const FloatingCard = ({ feature, index }: { feature: typeof safetyFeatures[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 50, rotateX: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group cursor-default"
    >
      <div className="relative rounded-2xl p-6 sm:p-8 border border-border/30 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-primary/40 h-full">
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: feature.color === "primary"
              ? "radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.12), transparent 70%)"
              : "radial-gradient(circle at 50% 0%, hsl(var(--accent)/0.12), transparent 70%)",
          }}
        />

        <motion.div
          className="relative z-10 w-14 h-14 rounded-xl border border-border/20 bg-gradient-to-br from-card to-card/50 flex items-center justify-center mb-5"
          style={{ transform: "translateZ(40px)" }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <feature.icon className={`w-6 h-6 ${feature.color === "primary" ? "text-primary" : "text-accent"}`} />
        </motion.div>

        <h3 className="relative z-10 font-display text-lg font-bold text-foreground mb-2" style={{ transform: "translateZ(20px)" }}>
          {feature.title}
        </h3>
        <p className="relative z-10 text-sm text-muted-foreground leading-relaxed" style={{ transform: "translateZ(10px)" }}>
          {feature.desc}
        </p>

        <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-[40px] transition-all duration-700 opacity-0 group-hover:opacity-100"
          style={{ background: feature.color === "primary" ? "hsl(var(--primary)/0.08)" : "hsl(var(--accent)/0.08)" }}
        />
      </div>
    </motion.div>
  );
};

const LandingSafety = () => {
  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/[0.02] blur-[180px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent tracking-wider uppercase">Security</span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Your Privacy,{" "}
            <span className="gradient-text">Our Priority</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Built with safety-first design. Every feature protects you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" style={{ perspective: "1200px" }}>
          {safetyFeatures.map((f, i) => (
            <FloatingCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingSafety;
