/**
 * Survey funnel analytics — lightweight event tracker.
 *
 * Events are batched and flushed on a 3s debounce or before page unload.
 * Fires to /api/analytics (or POST to the session API) as a non-blocking request.
 *
 * Event types:
 *   survey_start        → user clicks "Start Survey"
 *   step_viewed         → question step rendered
 *   step_answered       → user selects an answer
 *   step_back           → user navigates back
 *   survey_completed    → survey finishes (archetype assigned)
 *   survey_retake       → user clicks "Retake Survey"
 *   results_viewed      → results screen rendered
 *   drop_off            → beforeunload fires while survey is in progress
 */

const API_BASE = import.meta.env.DEV ? "http://localhost:3001/api" : "/api";

interface AnalyticsEvent {
    event: string;
    sessionId?: string;
    step?: number;
    questionId?: string;
    value?: string;
    meta?: Record<string, unknown>;
    timestamp: string;
}

let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY_MS = 3000;

function enqueue(evt: Omit<AnalyticsEvent, "timestamp">) {
    eventQueue.push({ ...evt, timestamp: new Date().toISOString() });
    scheduleFlush();
}

function scheduleFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
}

function flush() {
    if (eventQueue.length === 0) return;
    const batch = [...eventQueue];
    eventQueue = [];

    // Fire-and-forget — analytics should never block the UI
    try {
        const payload = JSON.stringify({ events: batch });

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: "application/json" });
            navigator.sendBeacon(`${API_BASE}/analytics`, blob);
        } else {
            fetch(`${API_BASE}/analytics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: payload,
                keepalive: true,
            }).catch(() => { /* swallow */ });
        }
    } catch {
        // Analytics should never throw
    }
}

// Flush remaining events when the user is about to leave
if (typeof window !== "undefined") {
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("beforeunload", flush);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function trackSurveyStart(sessionId: string) {
    enqueue({ event: "survey_start", sessionId });
}

export function trackStepViewed(sessionId: string, step: number, questionId: string) {
    enqueue({ event: "step_viewed", sessionId, step, questionId });
}

export function trackStepAnswered(sessionId: string, step: number, questionId: string, value?: string) {
    enqueue({ event: "step_answered", sessionId, step, questionId, value });
}

export function trackStepBack(sessionId: string, step: number, questionId: string) {
    enqueue({ event: "step_back", sessionId, step, questionId });
}

export function trackSurveyCompleted(sessionId: string, archetype: string) {
    enqueue({ event: "survey_completed", sessionId, meta: { archetype } });
    flush(); // immediate flush — completion is critical
}

export function trackSurveyRetake(sessionId: string, previousArchetype?: string) {
    enqueue({ event: "survey_retake", sessionId, meta: { previousArchetype } });
    flush();
}

export function trackResultsViewed(sessionId: string, archetype: string) {
    enqueue({ event: "results_viewed", sessionId, meta: { archetype } });
}

export function trackDropOff(sessionId: string, step: number, questionId: string) {
    enqueue({ event: "drop_off", sessionId, step, questionId });
    flush();
}
