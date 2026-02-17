import { neon } from "@neondatabase/serverless";

function getDb() {
    const url = (process.env.DATABASE_URL || "").replace(/^["']|["']$/g, "");
    if (!url) throw new Error("DATABASE_URL is not configured");
    return neon(url);
}

// ─── Session CRUD ──────────────────────────────────────────────────────────

export async function createSession(data: {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    referrerId?: string;
}) {
    const sql = getDb();
    const rows = await sql`
    INSERT INTO survey_sessions (session_id, ip_address, user_agent, referrer_id, answers, current_step)
    VALUES (${data.sessionId}, ${data.ipAddress ?? null}, ${data.userAgent ?? null}, ${data.referrerId ?? null}, ${JSON.stringify({})}::jsonb, 0)
    RETURNING *
  `;
    return rows[0];
}

export async function getSession(sessionId: string) {
    const sql = getDb();
    const rows = await sql`
    SELECT * FROM survey_sessions WHERE session_id = ${sessionId}
  `;
    return rows[0] ?? null;
}

export async function updateSession(
    sessionId: string,
    data: {
        name?: string;
        email?: string;
        currentStep?: number;
        answers?: Record<string, unknown>;
        archetypeResult?: string;
        archetypeData?: Record<string, unknown>;
        isCompleted?: boolean;
        completedAt?: string;
        promoCode?: string;
        certificateUrl?: string;
        aiSummary?: string;
    }
) {
    const sql = getDb();

    // Build dynamic SET clause pieces
    const sets: string[] = [];
    const vals: unknown[] = [];

    if (data.name !== undefined) {
        sets.push("name");
        vals.push(data.name);
    }
    if (data.email !== undefined) {
        sets.push("email");
        vals.push(data.email);
    }
    if (data.currentStep !== undefined) {
        sets.push("current_step");
        vals.push(data.currentStep);
    }
    if (data.answers !== undefined) {
        sets.push("answers");
        vals.push(JSON.stringify(data.answers));
    }
    if (data.archetypeResult !== undefined) {
        sets.push("archetype_result");
        vals.push(data.archetypeResult);
    }
    if (data.archetypeData !== undefined) {
        sets.push("archetype_data");
        vals.push(JSON.stringify(data.archetypeData));
    }
    if (data.isCompleted !== undefined) {
        sets.push("is_completed");
        vals.push(data.isCompleted);
    }
    if (data.completedAt !== undefined) {
        sets.push("completed_at");
        vals.push(data.completedAt);
    }
    if (data.promoCode !== undefined) {
        sets.push("promo_code");
        vals.push(data.promoCode);
    }
    if (data.certificateUrl !== undefined) {
        sets.push("certificate_url");
        vals.push(data.certificateUrl);
    }
    if (data.aiSummary !== undefined) {
        sets.push("ai_summary");
        vals.push(data.aiSummary);
    }

    if (sets.length === 0) return getSession(sessionId);

    // Use raw SQL update — neon serverless only supports tagged template literals,
    // so we construct the query manually for dynamic columns
    const setClauses = sets
        .map((col, i) => `${col} = $${i + 2}`)
        .join(", ");

    const query = `
    UPDATE survey_sessions
    SET ${setClauses}, updated_at = NOW()
    WHERE session_id = $1
    RETURNING *
  `;

    const rows = await sql.call(undefined, query as any, [sessionId, ...vals]);
    return (rows as any)[0] ?? null;
}

// Simplified update that uses tagged templates for common operations
export async function saveAnswers(
    sessionId: string,
    answers: Record<string, unknown>,
    currentStep: number
) {
    const sql = getDb();
    const answersJson = JSON.stringify(answers);
    const rows = await sql`
    UPDATE survey_sessions
    SET answers = ${answersJson}::jsonb, current_step = ${currentStep}, updated_at = NOW()
    WHERE session_id = ${sessionId}
    RETURNING *
  `;
    return rows[0] ?? null;
}

export async function saveUserInfo(
    sessionId: string,
    name: string,
    email: string | null
) {
    const sql = getDb();
    const rows = await sql`
    UPDATE survey_sessions
    SET name = ${name}, email = ${email}, updated_at = NOW()
    WHERE session_id = ${sessionId}
    RETURNING *
  `;
    return rows[0] ?? null;
}

// ─── Promo Codes ───────────────────────────────────────────────────────────

export async function createPromoCode(data: {
    code: string;
    sessionId: string;
    isRetake?: boolean;
    referrerId?: string;
    pointsValue?: number;
}) {
    const sql = getDb();
    const points = data.isRetake ? 100 : (data.pointsValue ?? 1000);
    const rows = await sql`
    INSERT INTO promo_codes (code, session_id, points_value, is_retake, referrer_id)
    VALUES (${data.code}, ${data.sessionId}, ${points}, ${data.isRetake ?? false}, ${data.referrerId ?? null})
    RETURNING *
  `;
    return rows[0];
}

// ─── Completion ────────────────────────────────────────────────────────────

export async function completeSession(
    sessionId: string,
    archetypeResult: string,
    archetypeData: Record<string, unknown>,
    promoCode: string
) {
    const sql = getDb();
    const rows = await sql`
    UPDATE survey_sessions
    SET archetype_result = ${archetypeResult},
        archetype_data = ${JSON.stringify(archetypeData)}::jsonb,
        promo_code = ${promoCode},
        is_completed = true,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE session_id = ${sessionId}
    RETURNING *
  `;
    return rows[0] ?? null;
}
