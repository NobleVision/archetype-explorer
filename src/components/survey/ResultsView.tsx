import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, RotateCcw, Share2, Copy, Check, Users } from "lucide-react";
import type { Archetype } from "@/data/archetypes";
import type { AISummary } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import PromoCodeDisplay from "./PromoCodeDisplay";
import AISummaryCard from "./AISummaryCard";
import CertificateCard from "./CertificateCard";
import Confetti from "./Confetti";
import { useToast } from "@/hooks/use-toast";

interface ResultsViewProps {
  archetype: Archetype;
  onRetake: () => void;
  promoCode?: string | null;
  sessionId?: string;
  aiSummary?: AISummary | null;
  certificateUrl?: string | null;
  aiLoading?: boolean;
  userName?: string;
}

const ResultsView = ({
  archetype,
  onRetake,
  promoCode,
  sessionId,
  aiSummary,
  certificateUrl,
  aiLoading = false,
  userName,
}: ResultsViewProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const { toast } = useToast();

  // Trigger confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const referralLink = sessionId
    ? `${window.location.origin}?ref=${sessionId}`
    : null;

  const handleCopyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setReferralCopied(true);
      toast({
        title: "Referral link copied!",
        description: "Share this with friends to earn 5,000 bonus points.",
      });
      setTimeout(() => setReferralCopied(false), 3000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 3000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Confetti celebration */}
      <Confetti active={showConfetti} />

      {/* Emoji + Archetype Label */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-4"
        >
          {archetype.emoji}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-semibold uppercase tracking-widest text-accent mb-2"
        >
          Your Archetype
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1"
        >
          {archetype.name}
        </motion.h2>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-8 leading-tight"
      >
        {archetype.headline}
      </motion.h1>

      {/* Body paragraphs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4 mb-6"
      >
        {archetype.body.map((paragraph, i) => (
          <p key={i} className="text-base text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </motion.div>

      {/* Bullet points */}
      <motion.ul
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="space-y-3 mb-10"
      >
        {archetype.bullets.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </motion.ul>

      {/* NuFounders Solution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mb-6"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lightbulb className="w-4.5 h-4.5 text-accent" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            NuFounders Solution
          </h3>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          {archetype.solution}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="bg-accent/5 rounded-2xl p-6 sm:p-8 border border-accent/20 mb-10"
      >
        <p className="text-base text-foreground leading-relaxed font-medium">
          {archetype.cta}
        </p>
      </motion.div>

      {/* ── AI Executive Summary ───────────────────────────────────────── */}
      <AISummaryCard
        summary={aiSummary ?? null}
        loading={aiLoading}
        userName={userName}
      />

      {/* ── Certificate ────────────────────────────────────────────────── */}
      <CertificateCard
        certificateUrl={certificateUrl ?? null}
        loading={aiLoading}
        userName={userName}
        archetypeName={archetype.name}
      />

      {/* ── Promo Code Section ────────────────────────────────────────── */}
      {promoCode && (
        <div className="mb-8">
          <PromoCodeDisplay code={promoCode} />
        </div>
      )}

      {/* ── Referral Link Section ─────────────────────────────────────── */}
      {referralLink && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="bg-card rounded-2xl p-6 border border-border mb-8"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Earn 5,000 Bonus Points
              </h3>
              <p className="text-xs text-muted-foreground">
                Share your referral link with friends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-background/80 rounded-lg border border-border px-3 py-2 truncate text-xs text-muted-foreground font-mono">
              {referralLink}
            </div>
            <Button
              id="copy-referral-btn"
              variant="outline"
              size="sm"
              onClick={handleCopyReferral}
              className={`gap-1.5 text-xs transition-all ${referralCopied
                ? "text-green-500 border-green-500/30"
                : "hover:border-accent"
                }`}
            >
              {referralCopied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3" /> Copy Link
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-2">
            When someone completes the survey using your link and redeems their promo code, you both earn bonus points!
          </p>
        </motion.div>
      )}

      {/* Retake button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <Button
          id="retake-survey-btn"
          variant="outline"
          onClick={onRetake}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Survey
        </Button>
      </motion.div>
    </div>
  );
};

export default ResultsView;

