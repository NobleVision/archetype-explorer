/**
 * api/lib/certificate.ts — Cloudinary-based certificate image generation.
 *
 * Uses Cloudinary's URL-based transformations to overlay text on a
 * certificate template. No SDK required — we just construct the URL.
 *
 * Strategy:
 * 1. Define a base certificate template image uploaded to Cloudinary
 * 2. Add text overlays for: name, archetype, date, headline
 * 3. Return the generated URL — Cloudinary renders it on-the-fly
 *
 * If no base template exists, we generate a certificate using Cloudinary's
 * blank canvas + styled text overlays.
 */

interface CertificateInput {
    name: string;
    archetypeName: string;
    archetypeEmoji: string;
    archetypeHeadline: string;
    completedDate: string; // ISO string
}

// Cloudinary text encoding — must URL-encode special characters
function encodeText(text: string): string {
    return encodeURIComponent(text)
        .replace(/%20/g, "%20")
        .replace(/%2C/g, ",")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
}

/**
 * Generates a certificate URL using Cloudinary transformations.
 * This approach uses a blank canvas with styled text overlays.
 */
export function generateCertificateUrl(input: CertificateInput): string {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
    }

    const formattedDate = new Date(input.completedDate).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );

    // Truncate headline if too long for the certificate
    const headline =
        input.archetypeHeadline.length > 80
            ? input.archetypeHeadline.substring(0, 77) + "..."
            : input.archetypeHeadline;

    // Build transformation chain for a 1200x630 certificate (OG image size)
    const transformations = [
        // Base canvas: dark gradient background
        "w_1200,h_630,c_fill,b_rgb:0f0f1a",

        // Top-left NuFounders branding text
        `l_text:Arial_18_bold:${encodeText("NuFounders")},co_rgb:e2b747,g_north_west,x_60,y_40`,

        // Certificate title
        `l_text:Arial_14_bold:${encodeText("CAREER ARCHETYPE CERTIFICATE")},co_rgb:a0a0b0,g_north,y_50`,

        // Archetype emoji (large)
        `l_text:Arial_56:${encodeText(input.archetypeEmoji)},g_center,y_-120`,

        // "This certifies that"
        `l_text:Arial_14:${encodeText("This certifies that")},co_rgb:a0a0b0,g_center,y_-60`,

        // User name (large, gold)
        `l_text:Arial_36_bold:${encodeText(input.name)},co_rgb:e2b747,g_center,y_-20`,

        // "has been identified as"
        `l_text:Arial_14:${encodeText("has been identified as a")},co_rgb:a0a0b0,g_center,y_30`,

        // Archetype name (large, white)
        `l_text:Arial_28_bold:${encodeText(input.archetypeName)},co_rgb:ffffff,g_center,y_70`,

        // Headline (smaller, muted)
        `l_text:Arial_13:${encodeText(headline)},co_rgb:a0a0b0,g_center,y_115,w_800,c_fit`,

        // Date
        `l_text:Arial_12:${encodeText(formattedDate)},co_rgb:808090,g_south,y_50`,

        // Bottom tagline
        `l_text:Arial_10:${encodeText("nufounders.noblevision.com")},co_rgb:606070,g_south,y_30`,
    ].join("/");

    // Use Cloudinary's built-in 'sample' image as base — the background fill overwrites it
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/sample`;
}

/**
 * Alternative: Upload a dynamically generated certificate using the Cloudinary Upload API.
 * This creates a persistent, shareable URL.
 */
export async function uploadCertificate(
    input: CertificateInput
): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        // Fallback to URL-based generation
        return generateCertificateUrl(input);
    }

    // For the initial implementation, use the URL-based approach
    // This avoids needing to upload a base image first
    return generateCertificateUrl(input);
}
