import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeScreen from "@/components/survey/WelcomeScreen";
import UserInfoScreen from "@/components/survey/UserInfoScreen";
import SurveyForm from "@/components/survey/SurveyForm";
import ResultsView from "@/components/survey/ResultsView";
import { classifyArchetype } from "@/data/archetypes";
import { useSession } from "@/hooks/useSession";
import type { AISummary } from "@/hooks/useSession";
import type { SurveyAnswers } from "@/data/surveyQuestions";
import type { Archetype } from "@/data/archetypes";
import { Loader2 } from "lucide-react";

type Phase = "welcome" | "user-info" | "survey" | "results";

const Index = () => {
  const {
    session,
    loading,
    saveProgress,
    saveUserInfo,
    completeSurvey,
    resetSession,
    generateResults,
  } = useSession();

  const [phase, setPhase] = useState<Phase>("welcome");
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // ── Restore phase from session state ─────────────────────────────────
  useEffect(() => {
    if (!session || loading) return;

    if (session.isCompleted && session.archetypeResult) {
      // Already completed — show results
      const result = classifyArchetype(session.answers as SurveyAnswers);
      setArchetype(result);
      setPromoCode(session.promoCode ?? null);
      setPhase("results");

      // Restore cached AI results or generate them
      if (session.aiSummary) {
        setAiSummary(session.aiSummary);
        setCertificateUrl(session.certificateUrl ?? null);
      } else {
        // Trigger background generation
        setAiLoading(true);
        generateResults().then((res) => {
          if (res) {
            setAiSummary(res.aiSummary);
            setCertificateUrl(res.certificateUrl ?? null);
          }
          setAiLoading(false);
        });
      }
    } else if (session.currentStep > 0 && Object.keys(session.answers).length > 0) {
      // Has progress — resume survey
      if (session.name) {
        setPhase("survey");
      } else {
        setPhase("user-info");
      }
    }
  }, [session, loading]);

  // ── Phase handlers ───────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setPhase("user-info");
  }, []);

  const handleUserInfoSubmit = useCallback(
    async (name: string, email?: string) => {
      await saveUserInfo(name, email);
      setPhase("survey");
    },
    [saveUserInfo]
  );

  const handleSaveProgress = useCallback(
    (answers: SurveyAnswers, step: number) => {
      saveProgress(answers as Record<string, unknown>, step);
    },
    [saveProgress]
  );

  const handleComplete = useCallback(
    async (answers: SurveyAnswers) => {
      const result = classifyArchetype(answers);
      setArchetype(result);

      // Complete survey on backend + get promo code
      const code = await completeSurvey(result.id, {
        name: result.name,
        emoji: result.emoji,
        headline: result.headline,
      });

      setPromoCode(code);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Trigger AI summary + certificate generation in background
      setAiLoading(true);
      generateResults().then((res) => {
        if (res) {
          setAiSummary(res.aiSummary);
          setCertificateUrl(res.certificateUrl ?? null);
        }
        setAiLoading(false);
      });
    },
    [completeSurvey, generateResults]
  );

  const handleRetake = useCallback(() => {
    setArchetype(null);
    setPromoCode(null);
    setAiSummary(null);
    setCertificateUrl(null);
    resetSession();
  }, [resetSession]);

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your session...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="w-full py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img
              src="/images/logo.jpeg"
              alt="NuFounders logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-xl font-serif font-bold text-foreground">
              Nu<span className="text-accent">Founders</span>
            </span>
          </motion.div>
          {phase !== "welcome" && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {phase === "user-info"
                ? "Getting Started"
                : phase === "survey"
                  ? "Survey"
                  : "Your Results"}
            </motion.span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-16">
        <div
          className="max-w-4xl mx-auto flex items-center justify-center"
          style={{ minHeight: "calc(100vh - 120px)" }}
        >
          <AnimatePresence mode="wait">
            {phase === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <WelcomeScreen onStart={handleStart} />
              </motion.div>
            )}
            {phase === "user-info" && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <UserInfoScreen
                  onContinue={handleUserInfoSubmit}
                  initialName={session?.name}
                  initialEmail={session?.email}
                />
              </motion.div>
            )}
            {phase === "survey" && (
              <motion.div
                key="survey"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <SurveyForm
                  onComplete={handleComplete}
                  initialAnswers={session?.answers as SurveyAnswers}
                  initialStep={session?.currentStep}
                  onSaveProgress={handleSaveProgress}
                />
              </motion.div>
            )}
            {phase === "results" && archetype && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full py-8"
              >
                <ResultsView
                  archetype={archetype}
                  onRetake={handleRetake}
                  promoCode={promoCode}
                  sessionId={session?.sessionId}
                  aiSummary={aiSummary}
                  certificateUrl={certificateUrl}
                  aiLoading={aiLoading}
                  userName={session?.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          Your responses are confidential and used only in aggregate to inform program development.
        </p>
      </footer>
    </div>
  );
};

export default Index;
