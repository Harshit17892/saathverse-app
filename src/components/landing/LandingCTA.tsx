import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.05] blur-[200px]" />
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-accent/[0.04] blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 5 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
        style={{ perspective: "800px" }}
      >
        <div className="relative rounded-3xl border border-border/30 bg-gradient-to-br from-card/80 via-card/40 to-card/80 backdrop-blur-sm p-10 sm:p-16 text-center overflow-hidden">
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-50"
            style={{
              background: "conic-gradient(from 0deg, transparent, hsl(var(--primary)/0.15), transparent, hsl(var(--accent)/0.15), transparent)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-card/95 to-background/95" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">Join the Movement</span>
            </motion.div>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Ready to{" "}
              <span className="gradient-text">Supercharge</span>
              <br />Your Campus Life?
            </h2>

            <p className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto mb-10">
              Join verified students building the future together.
            </p>

            <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: "0 20px 60px -15px hsl(var(--primary)/0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")}
                className="group flex items-center gap-3 px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg w-full sm:w-auto justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LandingCTA;
