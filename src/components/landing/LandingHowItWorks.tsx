import { motion } from "framer-motion";
import { UserPlus, Search, Users, Rocket, Trophy } from "lucide-react";
import { useState } from "react";

const steps = [
  { num: "01", icon: UserPlus, title: "Sign Up", desc: "Verify with your college email — only verified students get in." },
  { num: "02", icon: Search, title: "Discover", desc: "Search students by skills, branch, or interests across your campus." },
  { num: "03", icon: Users, title: "Connect", desc: "Send requests, chat securely, form teams for hackathons & startups." },
  { num: "04", icon: Rocket, title: "Launch", desc: "Submit startup ideas, get AI scoring, find co-founders & mentors." },
  { num: "05", icon: Trophy, title: "Grow", desc: "Join clubs, attend events, build your portfolio and campus network." },
];

const LandingHowItWorks = () => {
  const [active, setActive] = useState(2);

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/[0.03] blur-[150px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 block">How It Works</span>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Five Steps</span>
            <span className="text-foreground"> to Your Campus Network</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            From signup to building your dream team — here's how it works.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mb-12 sm:mb-16">
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-border/40 -translate-y-1/2 hidden sm:block" />
          <motion.div
            className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 hidden sm:block"
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              width: `${(active / (steps.length - 1)) * 100}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(active / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Step dots */}
          <div className="flex justify-between items-center relative">
            {steps.map((step, i) => (
              <motion.button
                key={step.num}
                onClick={() => setActive(i)}
                className="relative z-10 flex flex-col items-center gap-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-display font-bold text-sm sm:text-base transition-all duration-500 ${
                    i <= active
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg"
                      : "bg-card border border-border/50 text-muted-foreground"
                  }`}
                  style={{
                    boxShadow: i === active ? "0 0 30px hsl(var(--primary)/0.4)" : "none",
                  }}
                  animate={i === active ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {i === active ? <step.icon className="w-5 h-5 sm:w-6 sm:h-6" /> : step.num}
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active step detail cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4" style={{ perspective: "1000px" }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              onClick={() => setActive(i)}
              className="cursor-pointer"
              animate={{
                scale: i === active ? 1.03 : 1,
                rotateY: i === active ? 0 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <div
                className={`relative rounded-2xl p-5 sm:p-6 border transition-all duration-500 overflow-hidden ${
                  i === active
                    ? "border-primary/40 bg-gradient-to-b from-primary/10 to-card/80 shadow-2xl shadow-primary/10"
                    : "border-border/30 bg-card/40 hover:border-border/60"
                }`}
              >
                {/* Active glow bar */}
                {i === active && (
                  <motion.div
                    className="absolute bottom-0 left-1/4 right-1/4 h-[3px] rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
                    layoutId="activeBar"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <span className={`text-xs font-bold tracking-wider ${i === active ? "text-accent" : "text-muted-foreground"}`}>
                  {step.num}
                </span>
                <h3 className={`font-display font-bold mt-2 ${i === active ? "text-foreground text-lg" : "text-foreground/70 text-base"}`}>
                  {step.title}
                </h3>
                {i === active && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-muted-foreground mt-2 leading-relaxed"
                  >
                    {step.desc}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
