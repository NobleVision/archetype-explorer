import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateCardProps {
    certificateUrl: string | null | undefined;
    loading: boolean;
    userName?: string;
    archetypeName?: string;
}

const CertificateCard = ({
    certificateUrl,
    loading,
    userName,
    archetypeName,
}: CertificateCardProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);

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
                {/* Certificate skeleton */}
                <div className="w-full aspect-[1200/630] bg-muted/10 rounded-xl animate-pulse shimmer border border-border/50" />
            </motion.div>
        );
    }

    if (!certificateUrl) return null;

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
                        {userName ? `Personalized for ${userName}` : "Share your achievement"}
                    </p>
                </div>
            </div>

            {/* Certificate Image */}
            <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden border border-border/50 mb-4 bg-muted/5">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={certificateUrl}
                    alt={`${archetypeName || "Archetype"} Certificate for ${userName || "Entrepreneur"}`}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)} // Hide spinner on error too
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button
                    id="download-certificate-btn"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={() => {
                        // Open certificate in new tab for download
                        window.open(certificateUrl, "_blank");
                    }}
                >
                    <Download className="w-3.5 h-3.5" />
                    Download
                </Button>
                <Button
                    id="share-certificate-btn"
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={async () => {
                        if (navigator.share) {
                            try {
                                await navigator.share({
                                    title: `My NuFounders Archetype: ${archetypeName}`,
                                    text: `I just completed the NuFounders Career Archetype Survey and I'm a ${archetypeName}!`,
                                    url: certificateUrl,
                                });
                            } catch {
                                // User cancelled or share failed
                            }
                        } else {
                            // Fallback: copy URL to clipboard
                            navigator.clipboard.writeText(certificateUrl);
                        }
                    }}
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Share
                </Button>
            </div>
        </motion.div>
    );
};

export default CertificateCard;
