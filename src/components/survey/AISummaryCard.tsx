import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { AISummary } from "@/hooks/useSession";

interface AISummaryCardProps {
    summary: AISummary | null;
    loading: boolean;
    userName?: string;
}

/**
 * Skeleton placeholder while AI summary is being generated.
 */
const SummarySkeleton = () => (
    <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 shimmer" />
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted/30 rounded-lg w-2/3 shimmer" />
                <div className="h-3 bg-muted/20 rounded-lg w-1/2 shimmer" />
            </div>
        </div>
        <div className="h-3 bg-muted/20 rounded-lg w-full shimmer" />
        <div className="h-3 bg-muted/20 rounded-lg w-11/12 shimmer" />
        <div className="h-3 bg-muted/20 rounded-lg w-4/5 shimmer" />
        <div className="h-8 my-4" />
        <div className="h-3 bg-muted/20 rounded-lg w-full shimmer" />
        <div className="h-3 bg-muted/20 rounded-lg w-3/4 shimmer" />
        <div className="space-y-2 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted/20 shimmer" />
                    <div className="h-3 bg-muted/20 rounded-lg flex-1 shimmer" />
                </div>
            ))}
        </div>
    </div>
);

const AISummaryCard = ({ summary, loading, userName }: AISummaryCardProps) => {
    const [expanded, setExpanded] = useState(true);

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mb-8"
            >
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5 text-accent animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            Generating Your Executive Summary
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Our AI is analyzing your responses...
                        </p>
                    </div>
                </div>
                <SummarySkeleton />
            </motion.div>
        );
    }

    if (!summary) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-card rounded-2xl shadow-card border border-border mb-8 overflow-hidden"
        >
            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-6 sm:p-8 pb-4 text-left hover:bg-muted/5 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5 text-accent" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            Your Executive Summary
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            AI-powered personalized analysis
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
            </button>

            {/* Content — collapsible */}
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 sm:px-8 pb-6 sm:pb-8"
                >
                    {/* Headline */}
                    <p className="text-lg font-serif font-semibold text-foreground mb-5 border-l-2 border-accent pl-4">
                        {summary.headline}
                    </p>

                    {/* Summary body */}
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-6">
                        {summary.summary}
                    </div>

                    {/* Strengths */}
                    {summary.strengths.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <h4 className="text-sm font-semibold text-foreground">
                                    Your Strengths
                                </h4>
                            </div>
                            <ul className="space-y-2">
                                {summary.strengths.map((str, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                                        {str}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Next Steps */}
                    {summary.nextSteps.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <ArrowRight className="w-4 h-4 text-accent" />
                                <h4 className="text-sm font-semibold text-foreground">
                                    Recommended Next Steps
                                </h4>
                            </div>
                            <ol className="space-y-2">
                                {summary.nextSteps.map((step, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-start gap-3 text-sm text-muted-foreground"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-accent mt-0.5">
                                            {i + 1}
                                        </span>
                                        {step}
                                    </motion.li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Encouragement */}
                    {summary.encouragement && (
                        <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                "{summary.encouragement}"
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default AISummaryCard;
