import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSession, getSession, saveAnswers, saveUserInfo } from "./lib/db.js";
import { nanoid } from "nanoid";

/**
 * /api/session — Survey session management
 *
 * GET  ?id=<sessionId>                  → Retrieve existing session
 * POST { referrerId? }                  → Create new session
 * PUT  { sessionId, answers, step }     → Save progress
 * PATCH { sessionId, name, email? }     → Save user info
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        // ── GET: Retrieve session ────────────────────────────────────────────
        if (req.method === "GET") {
            const id = req.query.id as string;
            if (!id) return res.status(400).json({ error: "Missing session id" });

            const session = await getSession(id);
            if (!session) return res.status(404).json({ error: "Session not found" });

            return res.status(200).json(session);
        }

        // ── POST: Create new session ─────────────────────────────────────────
        if (req.method === "POST") {
            const { referrerId, sourceChannel, contactId, outreachId, email } = req.body ?? {};
            const sessionId = nanoid(24);
            const ipAddress =
                (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
                req.socket?.remoteAddress ||
                null;
            const userAgent = (req.headers["user-agent"] as string) || null;

            // Perform simple IP geolocation (if real IP available)
            let geoData: { city?: string, region?: string, country?: string } = {};

            // Skip localhost/private IPs to avoid API errors
            if (ipAddress && !ipAddress.match(/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|::1)/)) {
                try {
                    // Using ip-api.com (free, no-key, non-commercial use)
                    // Be mindful of rate limits (45 req/min)
                    const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city`);
                    if (geoRes.ok) {
                        const data = await geoRes.json();
                        if (data.status === 'success') {
                            geoData = {
                                city: data.city,
                                region: data.regionName,
                                country: data.country
                            };
                        }
                    }
                } catch (e) {
                    console.error("Geo lookup failed:", e);
                }
            }

            const session = await createSession({
                sessionId,
                ipAddress: ipAddress ?? undefined,
                userAgent: userAgent ?? undefined,
                referrerId,
                sourceChannel,
                contactId,
                outreachId,
                email: email || undefined,
                ...geoData
            });

            return res.status(201).json(session);
        }

        // ── PUT: Save answers & step progress ────────────────────────────────
        if (req.method === "PUT") {
            const { sessionId, answers, step } = req.body ?? {};
            if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

            // Fetch current session to detect step threshold crossing
            const prevSession = await getSession(sessionId);
            const prevStep = (prevSession as any)?.current_step ?? 0;

            const session = await saveAnswers(sessionId, answers ?? {}, step ?? 0);
            if (!session) return res.status(404).json({ error: "Session not found" });

            // Fire "survey started" webhook when user crosses step 3 threshold
            const STARTED_THRESHOLD = 3;
            if (step >= STARTED_THRESHOLD && prevStep < STARTED_THRESHOLD) {
                const webhookBase = process.env.NUFOUNDERS_WEBHOOK_URL;
                const webhookSecret = process.env.WEBHOOK_SECRET;
                // Derive the survey-started URL from the survey-completed URL
                const startedUrl = webhookBase
                    ? webhookBase.replace(/survey-completed$/, "survey-started")
                    : null;

                if (startedUrl) {
                    try {
                        const startedResp = await fetch(startedUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                ...(webhookSecret ? { "X-Webhook-Secret": webhookSecret } : {}),
                            },
                            body: JSON.stringify({
                                sessionId,
                                contactId: (session as any).contact_id || null,
                                outreachId: (session as any).outreach_id || null,
                            }),
                            signal: AbortSignal.timeout(5000),
                        });
                        console.log(`[survey-started webhook] Response: ${startedResp.status}`);
                    } catch (err: any) {
                        console.error("[survey-started webhook] Failed:", err.message);
                    }
                }
            }

            return res.status(200).json(session);
        }

        // ── PATCH: Save user info (name/email/phone/smsConsent) ────────────
        if (req.method === "PATCH") {
            const { sessionId, name, email, phoneNumber, smsConsent } = req.body ?? {};
            if (!sessionId || !name) {
                return res.status(400).json({ error: "Missing sessionId or name" });
            }

            const session = await saveUserInfo(sessionId, name, email || null, phoneNumber || null, smsConsent ?? false);
            if (!session) return res.status(404).json({ error: "Session not found" });

            return res.status(200).json(session);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        console.error("[/api/session] Error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
