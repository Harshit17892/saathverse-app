import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Rocket, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-accent/15" />
          <div className="absolute top-0 left-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[150px] sm:w-[300px] h-[150px] sm:h-[300px] rounded-full bg-accent/10 blur-[100px]" />

          {/* Animated border */}
          <motion.div
            className="absolute inset-0 rounded-2xl sm:rounded-3xl"
            style={{
              background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent, hsl(var(--primary) / 0.3))",
              opacity: 0.4,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative p-8 sm:p-12 md:p-20 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="h-14 w-14 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-primary/20"
            >
              <Rocket className="h-7 w-7 sm:h-9 sm:w-9 text-accent" />
            </motion.div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Ready to{" "}
              <span className="gradient-text">Transform</span>{" "}
              Your Campus Life?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 sm:mb-10 text-sm sm:text-lg px-2">
              Join thousands of students already building, connecting, and growing together. 
              Your next big project starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")}
                className="inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base overflow-hidden w-full sm:w-auto justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                <Sparkles className="h-5 w-5" />
                Sign Up Free
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-3 glass px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-foreground border border-border/50 hover:border-primary/40 transition-all w-full sm:w-auto justify-center"
              >
                <Shield className="h-5 w-5 text-accent" />
                Log In
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
