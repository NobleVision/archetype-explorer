import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const OptionCard = ({ label, selected, onClick, disabled }: OptionCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200
        ${
          selected
            ? "border-accent bg-accent/10 shadow-glow"
            : "border-border bg-card hover:border-accent/40 hover:shadow-card"
        }
        ${disabled && !selected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
            ${selected ? "border-accent bg-accent" : "border-muted-foreground/30"}
          `}
        >
          {selected && <Check className="w-3.5 h-3.5 text-card" strokeWidth={3} />}
        </div>
        <span className={`text-sm font-medium leading-snug ${selected ? "text-foreground" : "text-foreground/80"}`}>
          {label}
        </span>
      </div>
    </motion.button>
  );
};

export default OptionCard;
