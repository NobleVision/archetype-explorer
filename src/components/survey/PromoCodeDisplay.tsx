import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Gift, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PromoCodeDisplayProps {
    code: string;
    isRetake?: boolean;
}

const PromoCodeDisplay = ({ code, isRetake }: PromoCodeDisplayProps) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            toast({
                title: "Copied!",
                description: "Promo code has been copied to your clipboard.",
            });
            setTimeout(() => setCopied(false), 3000);
        } catch {
            // Fallback for environments without clipboard API
            const el = document.createElement("textarea");
            el.value = code;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    }, [code, toast]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-accent/10 p-6 sm:p-8 shadow-lg"
        >
            {/* Subtle sparkle decoration */}
            <div className="absolute top-3 right-3 text-accent/20">
                <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-3 left-3 text-accent/10">
                <Sparkles className="w-4 h-4" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-foreground">
                        Your Promo Code
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {isRetake ? "100 bonus points" : "Worth 1,000 bonus points!"}
                    </p>
                </div>
            </div>

            {/* Code display */}
            <div className="flex items-center gap-3 mb-4">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                    className="flex-1 bg-background/80 backdrop-blur-sm rounded-xl border border-border px-5 py-4 text-center"
                >
                    <span
                        id="promo-code-value"
                        className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-accent"
                    >
                        {code}
                    </span>
                </motion.div>

                <Button
                    id="copy-promo-code-btn"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className={`h-14 w-14 rounded-xl border-border transition-all duration-300 ${copied
                            ? "bg-green-500/10 border-green-500/30 text-green-500"
                            : "hover:border-accent hover:text-accent"
                        }`}
                >
                    {copied ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Copy className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 mb-5">
                <p className="text-xs text-amber-400 font-medium">
                    ⚠️ Save this code! It's unique to you and can only be used once.
                </p>
            </div>

            {/* How to use */}
            <div className="space-y-2 mb-5">
                <h4 className="text-sm font-semibold text-foreground">
                    How to use your promo code:
                </h4>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>
                        Visit{" "}
                        <a
                            href="https://nufounders.noblevision.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            nufounders.noblevision.com
                        </a>
                    </li>
                    <li>Create your account or log in</li>
                    <li>Enter this promo code on your Dashboard</li>
                    <li>Receive {isRetake ? "100" : "1,000"} bonus points instantly!</li>
                </ol>
            </div>

            {/* CTA Button */}
            <Button
                id="go-to-nufounders-btn"
                asChild
                className="w-full gap-2 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-glow font-semibold py-5 rounded-xl"
            >
                <a
                    href="https://nufounders.noblevision.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Go to NuFounders
                    <ExternalLink className="w-4 h-4" />
                </a>
            </Button>
        </motion.div>
    );
};

export default PromoCodeDisplay;
