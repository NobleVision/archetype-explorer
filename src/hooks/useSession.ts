/**
 * useSession — manages survey session lifecycle.
 *
 * - Creates a new session on mount (or restores from localStorage)
 * - Provides methods for persisting answers, user info, and completion
 * - Abstracts all API calls behind a clean interface
 * - Resilient: if backend is unreachable, falls back to localStorage-only
 */
import { useState, useEffect, useCallback, useRef } from "react";

const SESSION_KEY = "nf_survey_session_id";
const ANSWERS_KEY = "nf_survey_answers";
const STEP_KEY = "nf_survey_step";
const USER_INFO_KEY = "nf_survey_user_info";

// Use relative URLs in production (Vercel), absolute in dev
const API_BASE = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";

export interface AISummary {
    headline: string;
    summary: string;
    strengths: string[];
    nextSteps: string[];
    encouragement: string;
}

export interface SessionData {
    sessionId: string;
    name?: string;
    email?: string;
    currentStep: number;
    answers: Record<string, unknown>;
    isCompleted: boolean;
    promoCode?: string;
    archetypeResult?: string;
    aiSummary?: AISummary;
    certificateUrl?: string;
}

export function useSession() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const initRef = useRef(false);

    // ── Init: Create or restore session ──────────────────────────────────
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const init = async () => {
            try {
                const existingId = localStorage.getItem(SESSION_KEY);

                if (existingId) {
                    // Try to restore from backend
                    try {
                        const res = await fetch(`${API_BASE}/session?id=${existingId}`);
                        if (res.ok) {
                            const data = await res.json();
                            const parsedAiSummary = data.ai_summary
                                ? (typeof data.ai_summary === 'string' ? JSON.parse(data.ai_summary) : data.ai_summary)
                                : undefined;
                            const restored: SessionData = {
                                sessionId: data.session_id,
                                name: data.name || undefined,
                                email: data.email || undefined,
                                currentStep: data.current_step || 0,
                                answers: data.answers || {},
                                isCompleted: data.is_completed || false,
                                promoCode: data.promo_code || undefined,
                                archetypeResult: data.archetype_result || undefined,
                                aiSummary: parsedAiSummary,
                                certificateUrl: data.certificate_url || undefined,
                            };
                            setSession(restored);
                            setLoading(false);
                            return;
                        }
                    } catch {
                        // Backend unreachable — fall back to localStorage
                    }

                    // Fallback: restore from localStorage
                    const localAnswers = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "{}");
                    const localStep = parseInt(localStorage.getItem(STEP_KEY) || "0", 10);
                    const localUserInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "{}");

                    setSession({
                        sessionId: existingId,
                        name: localUserInfo.name,
                        email: localUserInfo.email,
                        currentStep: localStep,
                        answers: localAnswers,
                        isCompleted: false,
                    });
                    setLoading(false);
                    return;
                }

                // No existing session — create new
                const referrerId = new URLSearchParams(window.location.search).get("ref");
                try {
                    const res = await fetch(`${API_BASE}/session`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ referrerId }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const newId = data.session_id;
                        localStorage.setItem(SESSION_KEY, newId);
                        setSession({
                            sessionId: newId,
                            currentStep: 0,
                            answers: {},
                            isCompleted: false,
                        });
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Backend unreachable
                }

                // Fallback: generate local session ID
                const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
                localStorage.setItem(SESSION_KEY, localId);
                setSession({
                    sessionId: localId,
                    currentStep: 0,
                    answers: {},
                    isCompleted: false,
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // ── Save answers + step ──────────────────────────────────────────────
    const saveProgress = useCallback(
        async (answers: Record<string, unknown>, step: number) => {
            if (!session) return;

            // Always save to localStorage first (instant, reliable)
            localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
            localStorage.setItem(STEP_KEY, String(step));

            setSession((prev) => (prev ? { ...prev, answers, currentStep: step } : prev));

            // Then persist to backend (async, non-blocking)
            try {
                await fetch(`${API_BASE}/session`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.sessionId,
                        answers,
                        step,
                    }),
                });
            } catch {
                // Silently fail — localStorage has the data
            }
        },
        [session]
    );

    // ── Save user info ───────────────────────────────────────────────────
    const saveUserInfo = useCallback(
        async (name: string, email?: string) => {
            if (!session) return;

            localStorage.setItem(USER_INFO_KEY, JSON.stringify({ name, email }));
            setSession((prev) => (prev ? { ...prev, name, email } : prev));

            try {
                await fetch(`${API_BASE}/session`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.sessionId,
                        name,
                        email: email || null,
                    }),
                });
            } catch {
                // Silently fail
            }
        },
        [session]
    );

    // ── Complete survey ──────────────────────────────────────────────────
    const completeSurvey = useCallback(
        async (archetypeResult: string, archetypeData: Record<string, unknown>) => {
            if (!session) return null;

            try {
                const res = await fetch(`${API_BASE}/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.sessionId,
                        archetypeResult,
                        archetypeData,
                        isRetake: false,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    const promoCode = data.promoCode;

                    setSession((prev) =>
                        prev ? { ...prev, isCompleted: true, promoCode, archetypeResult } : prev
                    );

                    return promoCode as string;
                }
            } catch {
                // Backend unreachable — generate a local placeholder
            }

            // Fallback: no real promo code available
            setSession((prev) =>
                prev ? { ...prev, isCompleted: true, archetypeResult } : prev
            );
            return null;
        },
        [session]
    );

    // ── Reset for retake ─────────────────────────────────────────────────
    const resetSession = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ANSWERS_KEY);
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(USER_INFO_KEY);
        initRef.current = false;
        setSession(null);
        setLoading(true);

        // Re-trigger init on next render
        setTimeout(() => {
            initRef.current = false;
            window.location.reload();
        }, 100);
    }, []);

    // ── Generate AI results (async, post-completion) ─────────────────
    const generateResults = useCallback(
        async () => {
            if (!session || !session.isCompleted) return null;

            // Return cached if already generated
            if (session.aiSummary && session.certificateUrl) {
                return {
                    aiSummary: session.aiSummary,
                    certificateUrl: session.certificateUrl,
                };
            }

            try {
                const res = await fetch(`${API_BASE}/generate-results`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: session.sessionId }),
                });

                if (res.ok) {
                    const data = await res.json();
                    const aiSummary = data.aiSummary as AISummary;
                    const certificateUrl = data.certificateUrl as string | null;

                    setSession((prev) =>
                        prev
                            ? {
                                ...prev,
                                aiSummary,
                                certificateUrl: certificateUrl || undefined,
                            }
                            : prev
                    );

                    return { aiSummary, certificateUrl };
                }
            } catch {
                // Silently fail — results are supplementary
            }

            return null;
        },
        [session]
    );

    return {
        session,
        loading,
        error,
        saveProgress,
        saveUserInfo,
        completeSurvey,
        resetSession,
        generateResults,
    };
}
