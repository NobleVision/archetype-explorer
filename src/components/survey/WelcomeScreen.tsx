import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [agreed, setAgreed] = useState(false);

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
          className="flex flex-col items-center gap-6 mb-10"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              5–10 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" />
              Confidential
            </span>
          </div>

          {/* EULA / Consent Checkbox */}
          <div className="flex items-start gap-2 max-w-sm mx-auto text-left bg-muted/30 p-3 rounded-lg border border-border/50">
            <Checkbox 
              id="consent" 
              checked={agreed} 
              onCheckedChange={(c) => setAgreed(c === true)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm text-muted-foreground font-normal cursor-pointer"
              >
                I agree to the{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-accent underline underline-offset-4 cursor-pointer hover:text-accent/80">
                      User Data Agreement
                    </span>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Data Collection & Privacy</DialogTitle>
                      <DialogDescription className="pt-4 text-left space-y-3">
                        <p>
                          To provide the best possible placement matching and community experience, NuFounders collects specific data points during your survey session.
                        </p>
                        <div>
                          <strong className="text-foreground">What we collect:</strong>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Your IP address (used for approximate city/state location matching).</li>
                            <li>Survey responses regarding your career goals and background.</li>
                            <li>Browser type (User Agent) for analytics.</li>
                          </ul>
                        </div>
                        <div>
                          <strong className="text-foreground">How we use it:</strong>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>To match you with local peer groups and resources in your area.</li>
                            <li>To prevent duplicate submissions and ensure platform security.</li>
                            <li>To generate your personalized Career Archetype profile.</li>
                          </ul>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2 border-t">
                          By continuing, you consent to this data processing in accordance with our Privacy Policy.
                        </p>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                . I understand that my location data (city/state) may be used to match me with local opportunities.
              </Label>
            </div>
          </div>
        </motion.div>

        <Button
          onClick={onStart}
          disabled={!agreed}
          size="lg"
          className="gap-2 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-glow font-semibold px-8 py-6 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start the Survey
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
