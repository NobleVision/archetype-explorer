/**
 * api/lib/certificate.ts — Cloudinary-based certificate image generation.
 *
 * Uses Cloudinary's URL-based transformations to overlay text on a
 * solid-color canvas. Emoji characters are NOT supported by Cloudinary
 * text overlays, so we use text labels only.
 *
 * URL length is kept minimal — Cloudinary URLs must not be excessively
 * long or the CDN rejects them.
 */

interface CertificateInput {
    name: string;
    archetypeName: string;
    archetypeEmoji: string; // kept in interface but not rendered
    archetypeHeadline: string;
    completedDate: string; // ISO string
}

/**
 * Cloudinary text overlay encoding.
 * Spaces in text overlays use %20, and certain chars must be escaped.
 */
function ct(text: string): string {
    return text
        .replace(/,/g, "%2C")
        .replace(/\//g, "%2F");
}

/**
 * Generates a certificate URL using Cloudinary transformations.
 * Minimal overlays to keep URL under CDN limits.
 */
export function generateCertificateUrl(input: CertificateInput): string {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
    }

    const formattedDate = new Date(input.completedDate).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "long", day: "numeric" }
    );

    // Truncate name/headline to keep URL short
    const name = input.name.length > 40
        ? input.name.substring(0, 37) + "..."
        : input.name;

    const archetype = input.archetypeName.length > 50
        ? input.archetypeName.substring(0, 47) + "..."
        : input.archetypeName;

    // Build minimal transformation chain — 1200x630 (OG image dimensions)
    // Using pipe-separated chained transformations to keep URL shorter
    const t = [
        // Base: solid dark canvas
        "b_rgb:0f0f1a,c_scale,w_1200,h_630",
        // NuFounders branding (top-left, gold)
        `l_text:arial_20_bold:${ct("NuFounders")},co_rgb:e2b747,g_north_west,x_50,y_35`,
        // Title label
        `l_text:arial_12_bold:${ct("CAREER ARCHETYPE CERTIFICATE")},co_rgb:999999,g_north,y_45`,
        // "This certifies that" label
        `l_text:arial_15:${ct("This certifies that")},co_rgb:bbbbbb,g_center,y_-80`,
        // User name — Large, gold
        `l_text:arial_38_bold:${ct(name)},co_rgb:e2b747,g_center,y_-30`,
        // "has been identified as a"
        `l_text:arial_15:${ct("has been identified as a")},co_rgb:bbbbbb,g_center,y_25`,
        // Archetype name — Large, white
        `l_text:arial_32_bold:${ct(archetype)},co_rgb:ffffff,g_center,y_75`,
        // Date (bottom)
        `l_text:arial_13:${ct(formattedDate)},co_rgb:777777,g_south,y_40`,
    ].join("/");

    return `https://res.cloudinary.com/${cloudName}/image/upload/${t}/sample`;
}

/**
 * Alternative async wrapper (for future Cloudinary Upload API usage).
 */
export async function uploadCertificate(
    input: CertificateInput
): Promise<string> {
    return generateCertificateUrl(input);
}
