/**
 * Promo code generator — produces human-readable, URL-safe codes.
 * Format: NF-XXXXX-XXXXX (e.g., NF-K7M2P-9RW4X)
 *
 * Uses nanoid with a custom alphabet that excludes ambiguous chars (0/O, 1/l/I).
 */
import { customAlphabet } from "nanoid";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0,O,1,I,L
const generate = customAlphabet(ALPHABET, 10);

export function generatePromoCode(): string {
    const raw = generate(); // e.g., "K7M2P9RW4X"
    const part1 = raw.slice(0, 5);
    const part2 = raw.slice(5, 10);
    return `NF-${part1}-${part2}`;
}
