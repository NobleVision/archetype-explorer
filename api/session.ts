import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createSession, getSession, saveAnswers, saveUserInfo } from "./lib/db";
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
            const { referrerId } = req.body ?? {};
            const sessionId = nanoid(24);
            const ipAddress =
                (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
                req.socket?.remoteAddress ||
                null;
            const userAgent = (req.headers["user-agent"] as string) || null;

            const session = await createSession({
                sessionId,
                ipAddress: ipAddress ?? undefined,
                userAgent: userAgent ?? undefined,
                referrerId,
            });

            return res.status(201).json(session);
        }

        // ── PUT: Save answers & step progress ────────────────────────────────
        if (req.method === "PUT") {
            const { sessionId, answers, step } = req.body ?? {};
            if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

            const session = await saveAnswers(sessionId, answers ?? {}, step ?? 0);
            if (!session) return res.status(404).json({ error: "Session not found" });

            return res.status(200).json(session);
        }

        // ── PATCH: Save user info (name/email) ───────────────────────────────
        if (req.method === "PATCH") {
            const { sessionId, name, email } = req.body ?? {};
            if (!sessionId || !name) {
                return res.status(400).json({ error: "Missing sessionId or name" });
            }

            const session = await saveUserInfo(sessionId, name, email || null);
            if (!session) return res.status(404).json({ error: "Session not found" });

            return res.status(200).json(session);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err: any) {
        console.error("[/api/session] Error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
