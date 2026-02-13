/**
 * Confetti celebration animation — pure CSS + JS, no library dependency.
 * Renders 80 particles that burst from center with gravity and fade.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PARTICLE_COUNT = 80;
const COLORS = [
    "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6",
    "#ec4899", "#f97316", "#14b8a6", "#a855f7", "#06b6d4",
];

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotation: number;
    vx: number;
    vy: number;
    shape: "circle" | "rect" | "triangle";
}

function generateParticles(): Particle[] {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle = (Math.random() * Math.PI * 2);
        const velocity = 4 + Math.random() * 8;
        return {
            id: i,
            x: 50, // Start from center (%)
            y: 50,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 4 + Math.random() * 8,
            rotation: Math.random() * 360,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 3, // Initial upward bias
            shape: (["circle", "rect", "triangle"] as const)[Math.floor(Math.random() * 3)],
        };
    });
}

interface ConfettiProps {
    active: boolean;
    duration?: number; // ms before auto-dismiss
}

const Confetti = ({ active, duration = 4000 }: ConfettiProps) => {
    const [show, setShow] = useState(false);
    const [particles] = useState(generateParticles);

    useEffect(() => {
        if (active) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => {
                const endX = p.x + p.vx * 15; // Final position
                const endY = p.y + p.vy * 15 + 40; // Gravity pulls down

                return (
                    <motion.div
                        key={p.id}
                        initial={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            opacity: 1,
                            scale: 0,
                            rotate: 0,
                        }}
                        animate={{
                            left: `${endX}%`,
                            top: `${endY}%`,
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.2, 1, 0.5],
                            rotate: p.rotation + 720,
                        }}
                        transition={{
                            duration: 2 + Math.random() * 1.5,
                            ease: "easeOut",
                            delay: Math.random() * 0.3,
                        }}
                        style={{
                            position: "absolute",
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
                            borderRadius: p.shape === "circle" ? "50%" : p.shape === "rect" ? "2px" : "0",
                            borderLeft: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
                            borderRight: p.shape === "triangle" ? `${p.size / 2}px solid transparent` : undefined,
                            borderBottom: p.shape === "triangle" ? `${p.size}px solid ${p.color}` : undefined,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default Confetti;
