import { useRef } from "react";
import { motion } from "framer-motion";
import { Award, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateCardProps {
    certificateUrl?: string | null;
    loading?: boolean;
    userName?: string;
    archetypeName?: string;
    archetypeEmoji?: string;
    headline?: string;
}

/**
 * Renders a branded certificate as styled HTML/CSS.
 * No external image service required — 100% client-side.
 */
const CertificateCard = ({
    loading,
    userName = "Entrepreneur",
    archetypeName = "Visionary",
    archetypeEmoji = "🏆",
    headline,
}: CertificateCardProps) => {
    const certRef = useRef<HTMLDivElement>(null);

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mb-8"
            >
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Award className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            Generating Your Certificate
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Creating a personalized certificate...
                        </p>
                    </div>
                </div>
                <div className="w-full aspect-[1200/630] bg-muted/10 rounded-xl animate-pulse shimmer border border-border/50" />
            </motion.div>
        );
    }

    const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleDownload = async () => {
        // Simple screenshot approach — open as printable page
        const certEl = certRef.current;
        if (!certEl) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>NuFounders Certificate - ${userName}</title>
                <style>
                    body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f0f1a; }
                    .cert { width: 1200px; height: 630px; background: linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', 'Times New Roman', serif; color: #fff; position: relative; overflow: hidden; box-sizing: border-box; padding: 40px; }
                    .cert::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(226,183,71,0.2); border-radius: 8px; pointer-events: none; }
                    .brand { position: absolute; top: 24px; left: 36px; font-family: sans-serif; font-size: 16px; font-weight: 700; color: #e2b747; letter-spacing: 1px; }
                    .title { font-family: sans-serif; font-size: 11px; letter-spacing: 4px; color: #888; text-transform: uppercase; margin-bottom: 20px; }
                    .emoji { font-size: 48px; margin-bottom: 12px; }
                    .certifies { font-size: 13px; color: #999; margin-bottom: 4px; font-style: italic; }
                    .name { font-size: 36px; font-weight: 700; color: #e2b747; margin-bottom: 8px; }
                    .as { font-size: 13px; color: #999; margin-bottom: 4px; font-style: italic; }
                    .archetype { font-size: 28px; font-weight: 600; color: #fff; margin-bottom: 16px; }
                    .headline { font-size: 12px; color: #777; max-width: 500px; text-align: center; line-height: 1.5; }
                    .date { position: absolute; bottom: 28px; font-family: sans-serif; font-size: 11px; color: #555; }
                    @media print { body { background: white; } .cert { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="cert">
                    <div class="brand">NuFounders</div>
                    <div class="title">Career Archetype Certificate</div>
                    <div class="emoji">${archetypeEmoji}</div>
                    <div class="certifies">This certifies that</div>
                    <div class="name">${userName}</div>
                    <div class="as">has been identified as a</div>
                    <div class="archetype">${archetypeName}</div>
                    ${headline ? `<div class="headline">${headline}</div>` : ""}
                    <div class="date">${formattedDate}</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleShare = async () => {
        const shareText = `I just completed the NuFounders Career Archetype Survey and I'm ${archetypeName}! 🎉`;
        const shareUrl = window.location.origin;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My NuFounders Archetype: ${archetypeName}`,
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mb-8"
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                    <Award className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">
                        Your Archetype Certificate
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Personalized for {userName}
                    </p>
                </div>
            </div>

            {/* Certificate — pure HTML/CSS */}
            <div
                ref={certRef}
                className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden mb-4"
                style={{
                    background: "linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
                }}
            >
                {/* Inner border */}
                <div
                    className="absolute rounded-lg pointer-events-none"
                    style={{
                        inset: "10px",
                        border: "1px solid rgba(226,183,71,0.2)",
                    }}
                />

                {/* NuFounders branding */}
                <div
                    className="absolute font-bold"
                    style={{
                        top: "5%",
                        left: "5%",
                        color: "#e2b747",
                        fontSize: "clamp(10px, 2.5vw, 16px)",
                        fontFamily: "system-ui, sans-serif",
                        letterSpacing: "1px",
                    }}
                >
                    NuFounders
                </div>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                    {/* Title */}
                    <div
                        style={{
                            fontSize: "clamp(7px, 1.5vw, 11px)",
                            letterSpacing: "3px",
                            color: "#888",
                            textTransform: "uppercase",
                            fontFamily: "system-ui, sans-serif",
                            marginBottom: "clamp(6px, 2vw, 16px)",
                        }}
                    >
                        Career Archetype Certificate
                    </div>

                    {/* Emoji */}
                    <div
                        style={{
                            fontSize: "clamp(24px, 6vw, 48px)",
                            marginBottom: "clamp(4px, 1.5vw, 12px)",
                            lineHeight: 1,
                        }}
                    >
                        {archetypeEmoji}
                    </div>

                    {/* "This certifies that" */}
                    <div
                        style={{
                            fontSize: "clamp(8px, 1.6vw, 13px)",
                            color: "#999",
                            fontStyle: "italic",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            marginBottom: "clamp(2px, 0.5vw, 4px)",
                        }}
                    >
                        This certifies that
                    </div>

                    {/* Name */}
                    <div
                        style={{
                            fontSize: "clamp(16px, 4.5vw, 36px)",
                            fontWeight: 700,
                            color: "#e2b747",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            marginBottom: "clamp(2px, 0.8vw, 8px)",
                        }}
                    >
                        {userName}
                    </div>

                    {/* "has been identified as a" */}
                    <div
                        style={{
                            fontSize: "clamp(8px, 1.6vw, 13px)",
                            color: "#999",
                            fontStyle: "italic",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            marginBottom: "clamp(2px, 0.5vw, 4px)",
                        }}
                    >
                        has been identified as a
                    </div>

                    {/* Archetype name */}
                    <div
                        style={{
                            fontSize: "clamp(14px, 3.5vw, 28px)",
                            fontWeight: 600,
                            color: "#ffffff",
                            fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                    >
                        {archetypeName}
                    </div>
                </div>

                {/* Date (bottom) */}
                <div
                    className="absolute w-full text-center"
                    style={{
                        bottom: "6%",
                        fontSize: "clamp(7px, 1.4vw, 11px)",
                        color: "#555",
                        fontFamily: "system-ui, sans-serif",
                    }}
                >
                    {formattedDate}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button
                    id="download-certificate-btn"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleDownload}
                >
                    <Download className="w-3.5 h-3.5" />
                    Download
                </Button>
                <Button
                    id="share-certificate-btn"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleShare}
                >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                </Button>
            </div>
        </motion.div>
    );
};

export default CertificateCard;
