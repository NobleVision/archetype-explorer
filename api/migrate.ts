import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/migrate
 *
 * One-shot migration endpoint. Run once to fix schema issues.
 * Idempotent — safe to call multiple times.
 * Delete after migration is confirmed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Use GET" });
    }

    const secret = req.query.secret as string;
    if (secret !== "run_migration_2026") {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const sql = neon(process.env.DATABASE_URL!);

        // Widen certificate_url from varchar(500) to text
        await sql(`ALTER TABLE survey_sessions ALTER COLUMN certificate_url TYPE text`);

        return res.status(200).json({
            success: true,
            message: "Migration completed: certificate_url altered to TEXT",
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
