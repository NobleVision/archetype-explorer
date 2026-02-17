import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

/**
 * POST /api/analytics
 *
 * Receives batched funnel analytics events from the survey client.
 * Stores them in the `survey_events` table for funnel analysis.
 *
 * Body: { events: Array<{ event, sessionId?, step?, questionId?, value?, meta?, timestamp }> }
 *
 * The table is created lazily on first call if it doesn't exist.
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
        const url = (process.env.DATABASE_URL || "").replace(/^["']|["']$/g, "");
        if (!url) return res.status(500).json({ error: "DATABASE_URL not configured" });
        const sql = neon(url);

        // Parse body — supports both JSON fetch and sendBeacon (blob)
        let events: any[] = [];
        if (req.body?.events) {
            events = req.body.events;
        } else if (typeof req.body === "string") {
            try {
                events = JSON.parse(req.body).events || [];
            } catch { /* ignore parse errors */ }
        }

        if (!Array.isArray(events) || events.length === 0) {
            return res.status(200).json({ ok: true, inserted: 0 });
        }

        // Ensure table exists (idempotent)
        await sql`
      CREATE TABLE IF NOT EXISTS survey_events (
        id SERIAL PRIMARY KEY,
        event VARCHAR(64) NOT NULL,
        session_id VARCHAR(128),
        step INT,
        question_id VARCHAR(64),
        value TEXT,
        meta JSONB DEFAULT '{}'::jsonb,
        event_timestamp TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

        // Create index for session lookups (idempotent)
        await sql`
      CREATE INDEX IF NOT EXISTS idx_survey_events_session
      ON survey_events(session_id)
    `;

        // Batch insert all events
        let inserted = 0;
        for (const evt of events) {
            await sql`
        INSERT INTO survey_events (event, session_id, step, question_id, value, meta, event_timestamp)
        VALUES (
          ${evt.event || "unknown"},
          ${evt.sessionId || null},
          ${evt.step ?? null},
          ${evt.questionId || null},
          ${evt.value || null},
          ${JSON.stringify(evt.meta || {})}::jsonb,
          ${evt.timestamp || new Date().toISOString()}
        )
      `;
            inserted++;
        }

        return res.status(200).json({ ok: true, inserted });
    } catch (err: any) {
        console.error("[/api/analytics] Error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
