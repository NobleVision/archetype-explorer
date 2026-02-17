import { motion } from "framer-motion";
import { Award, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateCardProps {
    loading?: boolean;
    userName?: string;
    archetypeName?: string;
    archetypeEmoji?: string;
}

const CertificateCard = ({
    loading,
    userName = "Entrepreneur",
    archetypeName = "Visionary",
    archetypeEmoji = "🏆",
}: CertificateCardProps) => {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border mb-8 text-center"
            >
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                        <Award className="w-8 h-8 text-accent opacity-50" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">
                            Minting Your Badge
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Generating your unique Founder Badge...
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        "https://nufounders.com?promo=SURVEY_COMPLETE"
    )}&bgcolor=1a1a2e&color=e2b747`;

    const handleShare = async () => {
        const shareText = `I just earned the ${archetypeName} Badge from NuFounders! 🚀`;
        const shareUrl = "https://nufounders.com";

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My NuFounders Badge: ${archetypeName}`,
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="relative group perspective-1000 mb-8"
        >
            {/* Badge Card */}
            <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-[2rem] p-8 shadow-2xl border border-accent/20 overflow-hidden text-center max-w-sm mx-auto transform transition-transform hover:scale-[1.02] duration-300">
                {/* Glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-accent/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold tracking-widest uppercase text-accent mb-4">
                        <Award className="w-3 h-3" />
                        Official Badge
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white mb-1">
                        {userName}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">
                        is a certified
                    </p>
                </div>

                {/* Archetype Centerpiece */}
                <div className="relative z-10 py-6">
                    <div className="text-6xl mb-4 drop-shadow-lg filter grayscale-0">
                        {archetypeEmoji}
                    </div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-200 tracking-tight">
                        {archetypeName}
                    </h3>
                </div>

                {/* QR Code Section */}
                <div className="relative z-10 mt-6 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 inline-block">
                    <img
                        src={qrUrl}
                        alt="Scan to claim"
                        className="w-24 h-24 rounded-lg mix-blend-screen opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-wide uppercase">
                        Scan to Claim Offer
                    </p>
                </div>

                {/* Footer Branding */}
                <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>NuFounders.com</span>
                    <span>2026 Edition</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center mt-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    onClick={handleShare}
                >
                    <Share2 className="w-4 h-4" />
                    Share Badge
                </Button>
            </div>
        </motion.div>
    );
};

export default CertificateCard;
