/**
 * api/lib/ai.ts — AI summary generation for survey results.
 *
 * Uses OpenAI Chat Completions API directly (no shared wrapper with main app).
 * Generates a personalized executive summary based on archetype + survey answers.
 */

interface SummaryInput {
    name: string;
    archetypeId: string;
    archetypeName: string;
    archetypeHeadline: string;
    answers: Record<string, unknown>;
}

interface SummaryResult {
    headline: string;
    summary: string;
    strengths: string[];
    nextSteps: string[];
    encouragement: string;
}

// Map question IDs to human-readable labels for the prompt
const QUESTION_LABELS: Record<string, string> = {
    employment_status: "Employment Status",
    considering_business: "Business Interest Level",
    income_urgency: "Income Urgency",
    motivation: "Primary Motivation",
    biggest_barrier: "Biggest Barrier",
    income_goal: "Income Goal",
    support_types: "Desired Support Types",
    platform_helpfulness: "Platform Interest",
    early_access: "Early Access Interest",
    age_range: "Age Range",
    education: "Education Level",
    industry: "Industry Background",
    experience_years: "Years of Experience",
    state: "Location",
    prior_income: "Prior Income Range",
};

// Map answer values to readable labels
const VALUE_LABELS: Record<string, string> = {
    // Employment
    employed_full_time: "Employed full-time",
    contracted: "Contracted",
    employed_itching: "Employed but eager to start a business",
    laid_off_year: "Recently laid off",
    self_employed: "Self-employed",
    // Business interest
    exploring_only: "Exploring entrepreneurship",
    interested_unclear: "Interested but unclear on direction",
    actively_exploring: "Actively exploring ideas",
    building_intentionally: "Building intentionally",
    operating_growing: "Operating and growing a business",
    not_pursuing: "Focused on career transition",
    // Urgency
    exploring: "Exploring, no urgency",
    about_a_year: "Within about a year",
    "3_6_months": "Within 3-6 months",
    "1_3_months": "Within 1-3 months",
    asap: "As soon as possible",
    not_income_driven: "Purpose-driven, not income-focused",
    // Motivation
    immediate_financial: "Financial stability",
    lifestyle_flexibility: "Lifestyle flexibility",
    career_security: "Career security",
    limited_opportunities: "Limited job opportunities",
    purpose_impact: "Purpose and impact",
    wealth_scaling: "Wealth building",
    // Barriers
    business_setup: "Business setup and operations",
    finding_customers: "Finding customers",
    choosing_idea: "Choosing the right idea",
    confidence_risk: "Confidence and risk",
    capacity_support: "Capacity and support",
    financial_runway: "Financial runway",
    // Income goals
    first_customers: "Getting first paying customers",
    "500_1500": "$500-$1,500/month",
    "1500_3500": "$1,500-$3,500/month",
    "3500_7000": "$3,500-$7,000/month",
    "7000_12000": "$7,000-$12,000/month",
    replace_prior: "Replacing full prior income",
};

function humanize(questionId: string, value: unknown): string {
    if (Array.isArray(value)) {
        return value
            .map((v) => VALUE_LABELS[v] || String(v).replace(/_/g, " "))
            .join(", ");
    }
    const v = String(value);
    return VALUE_LABELS[v] || v.replace(/_/g, " ");
}

export async function generateAISummary(
    input: SummaryInput
): Promise<SummaryResult> {
    const apiKey = process.env.OPENAI_API;
    if (!apiKey) {
        throw new Error("OPENAI_API key is not configured");
    }

    // Build a readable profile from the answers
    const profileLines = Object.entries(input.answers)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([qId, val]) => {
            const label = QUESTION_LABELS[qId] || qId.replace(/_/g, " ");
            return `- ${label}: ${humanize(qId, val)}`;
        })
        .join("\n");

    const prompt = `You are a career archetype analyst for NuFounders, a platform empowering displaced professionals to become entrepreneurs.

A user named "${input.name}" has just completed our Career Archetype Survey and was classified as:

**${input.archetypeName}** — ${input.archetypeHeadline}

Their survey profile:
${profileLines}

Generate a personalized executive summary for this person. Your response should:

1. Be warm, empowering, and specific to their situation — NOT generic
2. Reference their actual answers (industry, motivation, barriers, etc.)
3. Highlight their unique strengths based on their profile
4. Provide 3-4 specific, actionable next steps tailored to their archetype and answers
5. End with a genuine encouragement message that references their potential

The tone should be professional but warm — like a seasoned mentor who sees their potential. Do not be overly promotional about NuFounders. Focus on the person.

Return a JSON object with this structure:
{
  "headline": "A single-sentence personalized tagline for this person (12 words max)",
  "summary": "2-3 paragraphs of personalized analysis (200-300 words)",
  "strengths": ["strength1", "strength2", "strength3"],
  "nextSteps": ["step1", "step2", "step3", "step4"],
  "encouragement": "A warm, specific closing message (2-3 sentences)"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a career analyst who generates personalized, empowering executive summaries for displaced professionals exploring entrepreneurship. Always return valid JSON.",
                },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1200,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("[AI] OpenAI API error:", response.status, err);
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("No content in OpenAI response");
    }

    return JSON.parse(content) as SummaryResult;
}
