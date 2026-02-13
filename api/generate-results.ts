import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSession, updateSession } from "./lib/db";
import { generateAISummary } from "./lib/ai";
import { generateCertificateUrl } from "./lib/certificate";

/**
 * POST /api/generate-results
 *
 * Body: { sessionId }
 *
 * Called asynchronously after survey completion to:
 * 1. Generate a personalized AI executive summary
 * 2. Generate a branded certificate image URL
 * 3. Persist both to the session record
 * 4. Return the results for display
 *
 * This endpoint is decoupled from /api/complete so the promo code
 * is shown immediately — the AI summary + certificate load in the background.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { sessionId } = req.body ?? {};

        if (!sessionId) {
            return res.status(400).json({ error: "Missing sessionId" });
        }

        // 1. Fetch session to get answers + archetype
        const session = await getSession(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const s = session as Record<string, any>;

        if (!s.is_completed || !s.archetype_result) {
            return res.status(400).json({ error: "Survey not completed yet" });
        }

        // If already generated, return cached results
        if (s.ai_summary && s.certificate_url) {
            return res.status(200).json({
                success: true,
                cached: true,
                aiSummary: JSON.parse(s.ai_summary),
                certificateUrl: s.certificate_url,
            });
        }

        const archetypeData = (
            typeof s.archetype_data === "string"
                ? JSON.parse(s.archetype_data)
                : s.archetype_data
        ) || {};

        const answers = (
            typeof s.answers === "string"
                ? JSON.parse(s.answers)
                : s.answers
        ) || {};

        const userName = s.name || "Entrepreneur";

        // 2. Generate AI summary
        let aiSummary;
        try {
            aiSummary = await generateAISummary({
                name: userName,
                archetypeId: s.archetype_result,
                archetypeName: archetypeData.name || s.archetype_result,
                archetypeHeadline: archetypeData.headline || "",
                answers,
            });
        } catch (err: any) {
            console.error("[generate-results] AI summary failed:", err.message);
            // Provide a graceful fallback
            aiSummary = {
                headline: `Your path as ${archetypeData.name || "an entrepreneur"}`,
                summary: `Based on your survey responses, you've been classified as ${archetypeData.name || s.archetype_result}. ${archetypeData.headline || ""} Your unique combination of experience and motivation positions you well for the next phase of your journey.`,
                strengths: [
                    "Self-awareness about your career direction",
                    "Willingness to explore entrepreneurship",
                    "Commitment to professional growth",
                ],
                nextSteps: [
                    "Review your archetype profile and identify resonating themes",
                    "Explore NuFounders resources tailored to your archetype",
                    "Connect with others on a similar journey",
                    "Start small — test one idea this week",
                ],
                encouragement:
                    "Every successful founder started exactly where you are now. Your willingness to take this survey shows the kind of initiative that builds real businesses.",
            };
        }

        // 3. Generate certificate URL
        let certificateUrl;
        try {
            certificateUrl = generateCertificateUrl({
                name: userName,
                archetypeName: archetypeData.name || s.archetype_result,
                archetypeEmoji: archetypeData.emoji || "🏆",
                archetypeHeadline: archetypeData.headline || "",
                completedDate: s.completed_at || new Date().toISOString(),
            });
        } catch (err: any) {
            console.error("[generate-results] Certificate generation failed:", err.message);
            certificateUrl = null;
        }

        // 4. Persist to database
        try {
            await updateSession(sessionId, {
                aiSummary: JSON.stringify(aiSummary),
                certificateUrl: certificateUrl || undefined,
            });
        } catch (err: any) {
            console.error("[generate-results] DB update failed:", err.message);
            // Continue — still return the results to the user
        }

        return res.status(200).json({
            success: true,
            cached: false,
            aiSummary,
            certificateUrl,
        });
    } catch (err: any) {
        console.error("[/api/generate-results] Error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
