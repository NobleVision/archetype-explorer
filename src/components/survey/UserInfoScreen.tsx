import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserInfoScreenProps {
    onContinue: (name: string, email?: string) => void;
    initialName?: string;
    initialEmail?: string;
}

const UserInfoScreen = ({ onContinue, initialName }: UserInfoScreenProps) => {
    const [name, setName] = useState(initialName || "");
    const [nameError, setNameError] = useState<string | null>(null);

    const validateAndContinue = () => {
        let hasErrors = false;

        if (!name.trim()) {
            setNameError("Please enter your name");
            hasErrors = true;
        } else {
            setNameError(null);
        }

        if (hasErrors) return;

        onContinue(name.trim(), undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") validateAndContinue();
    };

    return (
        <div className="w-full max-w-md mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Greeting */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6"
                >
                    <User className="w-8 h-8 text-accent" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
                    Before we begin
                </h2>
                <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                    Tell us a bit about yourself. Your information is kept confidential and used only to personalize your results.
                </p>

                {/* Name field */}
                <div className="text-left mb-8">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Your Name <span className="text-accent">*</span>
                    </label>
                    <div className="relative">
                        <Input
                            id="user-name-input"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (nameError) setNameError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            className={`bg-card border-border focus:border-accent focus:ring-accent pl-10 py-5 ${nameError ? "border-red-400 focus:border-red-400" : ""
                                }`}
                        />
                        <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {nameError && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-400 mt-1 flex items-center gap-1"
                        >
                            <AlertCircle className="w-3 h-3" />
                            {nameError}
                        </motion.p>
                    )}
                </div>

                <Button
                    id="continue-to-survey-btn"
                    onClick={validateAndContinue}
                    size="lg"
                    className="w-full gap-2 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-glow font-semibold px-8 py-6 text-base rounded-xl"
                >
                    Continue to Survey
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </motion.div>
        </div>
    );
};

export default UserInfoScreen;
