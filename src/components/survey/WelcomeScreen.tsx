import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src="/images/nufounder-logo.jfif"
          alt="NuFounders logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 140 }}
          className="mx-auto mb-8 w-28 h-28 object-contain rounded-2xl shadow-lg"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Career Transition Survey
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground mb-5 leading-tight">
          NuFounders{" "}
          <span className="relative inline-block">
            Career Archetype
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute bottom-1 left-0 right-0 h-3 bg-accent/20 -z-10 origin-left rounded"
            />
          </span>{" "}
          Survey
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
          Whether you're exploring, pivoting, or already building — this survey will help identify
          your unique business profile, as well as our solution to help you attain your goals.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-6 mb-10 text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent" />
            5–10 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" />
            Confidential
          </span>
        </motion.div>

        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-glow font-semibold px-8 py-6 text-base rounded-xl"
        >
          Start the Survey
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
