import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface UserInfoScreenProps {
    onContinue: (name: string, email?: string, phoneNumber?: string, smsConsent?: boolean) => void;
    initialName?: string;
    initialEmail?: string;
}

const UserInfoScreen = ({ onContinue, initialName, initialEmail }: UserInfoScreenProps) => {
    const [name, setName] = useState(initialName || "");
    const [nameError, setNameError] = useState<string | null>(null);
    const [email, setEmail] = useState(initialEmail || "");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [smsConsent, setSmsConsent] = useState(false);

    // If email was pre-populated from URL invite, don't show the email field
    const hasPrePopulatedEmail = !!initialEmail;

    const validateAndContinue = () => {
        let hasErrors = false;

        if (!name.trim()) {
            setNameError("Please enter your name");
            hasErrors = true;
        } else {
            setNameError(null);
        }

        // Validate email if shown (not pre-populated)
        if (!hasPrePopulatedEmail) {
            const emailVal = email.trim();
            if (!emailVal) {
                setEmailError("Please enter your email address");
                hasErrors = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                setEmailError("Please enter a valid email address");
                hasErrors = true;
            } else {
                setEmailError(null);
            }
        }

        if (hasErrors) return;

        onContinue(
            name.trim(),
            hasPrePopulatedEmail ? initialEmail : email.trim(),
            phoneNumber.trim() || undefined,
            phoneNumber.trim() ? smsConsent : undefined,
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") validateAndContinue();
    };

    const hasPhone = phoneNumber.trim().length > 0;

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
                <div className="text-left mb-6">
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

                {/* Email field — only shown if not pre-populated from URL */}
                {!hasPrePopulatedEmail && (
                    <div className="text-left mb-6">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                            Email Address <span className="text-accent">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="user-email-input"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError(null);
                                }}
                                onKeyDown={handleKeyDown}
                                className={`bg-card border-border focus:border-accent focus:ring-accent pl-10 py-5 ${emailError ? "border-red-400 focus:border-red-400" : ""
                                    }`}
                            />
                            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        {emailError && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-400 mt-1 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {emailError}
                            </motion.p>
                        )}
                    </div>
                )}

                {/* Phone number field (optional) */}
                <div className="text-left mb-6">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Mobile Phone <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="relative">
                        <Input
                            id="user-phone-input"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                if (!e.target.value.trim()) setSmsConsent(false);
                            }}
                            onKeyDown={handleKeyDown}
                            className="bg-card border-border focus:border-accent focus:ring-accent pl-10 py-5"
                        />
                        <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* SMS Consent checkbox — only shown when phone number is entered */}
                <AnimatePresence>
                    {hasPhone && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-start gap-2.5 text-left bg-muted/30 p-3 rounded-lg border border-border/50 mb-6">
                                <Checkbox
                                    id="sms-consent"
                                    checked={smsConsent}
                                    onCheckedChange={(c) => setSmsConsent(c === true)}
                                    className="mt-0.5 shrink-0"
                                />
                                <Label
                                    htmlFor="sms-consent"
                                    className="text-xs text-muted-foreground font-normal cursor-pointer leading-relaxed"
                                >
                                    I agree to receive SMS messages from NuFounders about the survey and related follow-up updates.
                                    Message frequency varies. Msg &amp; data rates may apply.
                                    Reply STOP to opt out and HELP for help.
                                    Consent is not a condition of participation.
                                    See{" "}
                                    <a
                                        href="https://www.nufounders.com/privacy-policy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent underline underline-offset-4 hover:text-accent/80"
                                    >
                                        Privacy Policy
                                    </a>
                                    {" "}and{" "}
                                    <a
                                        href="https://www.nufounders.com/terms-and-conditions"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent underline underline-offset-4 hover:text-accent/80"
                                    >
                                        Terms &amp; Conditions
                                    </a>.
                                </Label>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
