import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { surveyQuestions, type SurveyAnswers } from "@/data/surveyQuestions";
import { trackStepViewed, trackStepAnswered, trackStepBack } from "@/lib/analytics";
import ProgressBar from "./ProgressBar";
import OptionCard from "./OptionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

interface SurveyFormProps {
  onComplete: (answers: SurveyAnswers) => void;
  initialAnswers?: SurveyAnswers;
  initialStep?: number;
  onSaveProgress?: (answers: SurveyAnswers, step: number) => void;
  sessionId?: string;
}

const SurveyForm = ({
  onComplete,
  initialAnswers,
  initialStep,
  onSaveProgress,
  sessionId,
}: SurveyFormProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);
  const [answers, setAnswers] = useState<SurveyAnswers>(initialAnswers ?? {});
  const [email, setEmail] = useState("");
  const [otherText, setOtherText] = useState("");
  const [direction, setDirection] = useState(1);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Restore email/otherText from answers on mount or step change
  useEffect(() => {
    const question = surveyQuestions[currentStep];
    if (question?.type === "email-conditional") {
      setEmail((answers[question.id + "_email"] as string) || "");
    }
    if (question?.id === "employment_status" && answers[question.id] === "other") {
      setOtherText((answers[question.id + "_other"] as string) || "");
    }
    // Track step view
    if (sessionId && question) {
      trackStepViewed(sessionId, currentStep, question.id);
    }
    // Reset popover state when step changes
    setOpen(false);
  }, [currentStep, sessionId]);

  const question = surveyQuestions[currentStep];
  const isLastStep = currentStep === surveyQuestions.length - 1;

  const currentAnswer = answers[question.id];

  const emailRequiredOptions = ["yes_apply", "yes_learn_more", "maybe", "maybe_later"];
  const needsEmail =
    question.type === "email-conditional" &&
    emailRequiredOptions.includes(currentAnswer as string);
  const needsOtherText =
    question.id === "employment_status" && currentAnswer === "other";

  const hasAnswer =
    question.type === "multi"
      ? Array.isArray(currentAnswer) && currentAnswer.length > 0
      : question.type === "email-conditional"
        ? needsEmail
          ? email.trim().length > 0
          : !!currentAnswer
        : needsOtherText
          ? otherText.trim().length > 0
          : !!currentAnswer;

  const handleSelect = (value: string) => {
    // Track answer selection
    if (sessionId) {
      trackStepAnswered(sessionId, currentStep, question.id, value);
    }

    if (question.type === "multi") {
      const current = (answers[question.id] as string[]) || [];
      const max = question.maxSelections || Infinity;
      if (current.includes(value)) {
        setAnswers({ ...answers, [question.id]: current.filter((v) => v !== value) });
      } else if (current.length < max) {
        setAnswers({ ...answers, [question.id]: [...current, value] });
      }
    } else if (question.type === "email-conditional") {
      setAnswers({ ...answers, [question.id]: value });
      if (!emailRequiredOptions.includes(value)) {
        setEmail("");
        setEmailError(null);
      }
    } else {
      setAnswers({ ...answers, [question.id]: value });
      if (value !== "other") setOtherText("");
      if (question.type === "dropdown") setOpen(false);
    }
  };

  const getNextStep = (current: number): number => {
    const q = surveyQuestions[current];
    if (q.id === "considering_business" && answers[q.id] === "not_pursuing") {
      const q7Index = surveyQuestions.findIndex((sq) => sq.id === "income_goal");
      if (q7Index !== -1) return q7Index;
    }
    return current + 1;
  };

  const getPrevStep = (current: number): number => {
    const q2Index = surveyQuestions.findIndex((sq) => sq.id === "considering_business");
    const q7Index = surveyQuestions.findIndex((sq) => sq.id === "income_goal");
    if (current === q7Index && answers["considering_business"] === "not_pursuing") {
      return q2Index;
    }
    return current - 1;
  };

  const handleNext = () => {
    if (!hasAnswer) return;

    // Validate email with Zod
    if (question.type === "email-conditional" && needsEmail) {
      const result = emailSchema.safeParse(email.trim());
      if (!result.success) {
        setEmailError(result.error.errors[0].message);
        return;
      }
      setEmailError(null);
    }

    // Build updated answers with email/other text
    let updatedAnswers = { ...answers };
    if (question.type === "email-conditional" && needsEmail) {
      updatedAnswers = { ...updatedAnswers, [question.id + "_email"]: email.trim() };
    }
    if (needsOtherText) {
      updatedAnswers = { ...updatedAnswers, [question.id + "_other"]: otherText.trim() };
    }

    setAnswers(updatedAnswers);

    if (isLastStep) {
      // Save one final time before completing
      onSaveProgress?.(updatedAnswers, currentStep);
      onComplete(updatedAnswers);
    } else {
      const nextStep = getNextStep(currentStep);

      // Auto-save progress to backend
      onSaveProgress?.(updatedAnswers, nextStep);

      setDirection(1);
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (sessionId) trackStepBack(sessionId, currentStep, question.id);
      setEmailError(null);
      setDirection(-1);
      setCurrentStep(getPrevStep(currentStep));
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ProgressBar current={currentStep} total={surveyQuestions.length} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mt-8"
        >
          {question.section && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold tracking-wide uppercase mb-4"
            >
              {question.section}
            </motion.span>
          )}

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-6 leading-snug">
            {question.text}
          </h2>

          {question.type === "multi" && (
            <p className="text-sm text-muted-foreground mb-4">
              Select up to {question.maxSelections} options
            </p>
          )}

          {question.type === "dropdown" ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between bg-card border-border focus:border-accent focus:ring-accent hover:bg-card text-left font-normal py-6 px-4 text-base",
                    !currentAnswer && "text-muted-foreground"
                  )}
                >
                  {currentAnswer
                    ? question.options.find((option) => option.value === currentAnswer)?.label
                    : "Select an option..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                      {question.options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => handleSelect(option.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              currentAnswer === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected =
                  question.type === "multi"
                    ? ((currentAnswer as string[]) || []).includes(option.value)
                    : currentAnswer === option.value;

                const isDisabled =
                  question.type === "multi" &&
                  !isSelected &&
                  ((currentAnswer as string[]) || []).length >= (question.maxSelections || Infinity);

                return (
                  <OptionCard
                    key={option.value}
                    label={option.label}
                    selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    disabled={isDisabled}
                  />
                );
              })}
            </div>
          )}

          {needsOtherText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <Textarea
                placeholder="Please explain"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="bg-card border-border focus:border-accent focus:ring-accent"
              />
            </motion.div>
          )}

          {question.type === "email-conditional" && needsEmail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <Input
                id="survey-email-input"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className={`bg-card border-border focus:border-accent focus:ring-accent ${emailError ? "border-red-400 focus:border-red-400" : ""
                  }`}
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {emailError}
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          id="survey-next-btn"
          onClick={handleNext}
          disabled={!hasAnswer}
          className="gap-2 bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-glow font-semibold px-6"
        >
          {isLastStep ? "See My Results" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SurveyForm;
