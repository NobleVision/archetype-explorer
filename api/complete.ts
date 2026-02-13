import type { VercelRequest, VercelResponse } from "@vercel/node";
import { completeSession, createPromoCode } from "./lib/db.js";
import { generatePromoCode } from "./lib/promo.js";

/**
 * POST /api/complete
 *
 * Body: { sessionId, archetypeResult, archetypeData, isRetake? }
 *
 * 1. Generates a unique promo code
 * 2. Marks the session as completed with archetype result
 * 3. Creates the promo_codes record
 * 4. Fires webhook to NuFounders main app (async, non-blocking)
 * 5. Returns the completed session + promo code
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
        const { sessionId, archetypeResult, archetypeData, isRetake } = req.body ?? {};

        if (!sessionId || !archetypeResult) {
            return res.status(400).json({
                error: "Missing required fields: sessionId, archetypeResult",
            });
        }

        // 1. Generate unique promo code
        const promoCode = generatePromoCode();

        // 2. Mark session complete
        const session = await completeSession(
            sessionId,
            archetypeResult,
            archetypeData || {},
            promoCode
        );

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        // 3. Create promo code record
        await createPromoCode({
            code: promoCode,
            sessionId,
            isRetake: isRetake ?? false,
            referrerId: (session as any).referrer_id ?? undefined,
            pointsValue: isRetake ? 100 : 1000,
        });

        // 4. Fire webhook (async, non-blocking)
        const webhookUrl = process.env.NUFOUNDERS_WEBHOOK_URL;
        const webhookSecret = process.env.WEBHOOK_SECRET;

        if (webhookUrl) {
            fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(webhookSecret ? { "X-Webhook-Secret": webhookSecret } : {}),
                },
                body: JSON.stringify({
                    event: isRetake ? "survey.retake_completed" : "survey.completed",
                    sessionId,
                    archetypeResult,
                    promoCode,
                    name: (session as any).name,
                    email: (session as any).email,
                    completedAt: new Date().toISOString(),
                }),
            }).catch((err) => {
                console.error("[webhook] Failed to fire:", err.message);
            });
        }

        return res.status(200).json({
            success: true,
            promoCode,
            session,
        });
    } catch (err: any) {
        console.error("[/api/complete] Error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
