import type { SurveyAnswers } from "./surveyQuestions";

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  headline: string;
  body: string[];
  bullets: string[];
  solution: string;
  cta: string;
  color: string;
}

export const archetypes: Archetype[] = [
  {
    id: "curious_explorer",
    name: "The Curious Explorer",
    emoji: "🔭",
    headline: "You're Exploring What's Possible — And That's Exactly Where Most Founders Start.",
    body: [
      "Right now, you're in discovery mode. You're curious about entrepreneurship, but you're still figuring out if it's the right path for you — and that's completely normal.",
      "Most successful founders don't start with certainty. They start with curiosity, skill, and a desire for more control over their future.",
      "Where people like you usually get stuck is:",
    ],
    bullets: [
      "Too many ideas",
      "Not knowing what's realistic",
      "Consuming information without clear next steps",
    ],
    solution: "NuFounders was built to help people move from learning → testing → earning — without needing to \"go all in\" before you're ready.",
    cta: "The fastest progress usually comes from testing small, low-risk ways to turn skills into real market demand.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "overwhelmed_starter",
    name: "The Overwhelmed Starter",
    emoji: "🧩",
    headline: "You're Ready To Start — You Just Need a Clear Path.",
    body: [
      "You're past curiosity. You want to build something of your own — you just don't want to waste time, money, or energy going in the wrong direction.",
      "Most people in your stage don't fail because they lack ability. They stall because they lack:",
    ],
    bullets: [
      "Clear sequencing",
      "Offer clarity",
      "Confidence in what will actually sell",
    ],
    solution: "NuFounders helps you go from: Idea → Offer → Customers → Revenue — with built-in marketplace exposure and guided execution.",
    cta: "If you want to see how this could accelerate your first real revenue, early access may be worth exploring.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    id: "displaced_rebuilder",
    name: "The Recently Displaced Rebuilder",
    emoji: "🔨",
    headline: "You're Rebuilding — And That Can Become Your Strongest Advantage.",
    body: [
      "You're not just exploring entrepreneurship. You're looking for stability, control, and a path forward that isn't dependent on employer decisions.",
      "Many strong businesses are started during career transition periods — not despite them, but because of them.",
      "Right now your biggest leverage is:",
    ],
    bullets: [
      "Existing skills",
      "Speed to market",
      "Focus on real income, not theory",
    ],
    solution: "NuFounders was designed specifically to shorten the path from skills → customers → income through AI matching + marketplace access.",
    cta: "If you're looking for faster ways to turn experience into income, early cohort access could be a strong fit.",
    color: "from-orange-500 to-amber-400",
  },
  {
    id: "pivoting_professional",
    name: "The Pivoting Professional",
    emoji: "🧭",
    headline: "You're Positioned To Build Something Real — Not Just Experiment.",
    body: [
      "You're approaching entrepreneurship intentionally. You're not looking for hype — you're looking for a model that works.",
      "You likely already have:",
    ],
    bullets: [
      "Marketable expertise",
      "Professional credibility",
      "Real-world problem knowledge",
    ],
    solution: "NuFounders focuses on turning professional skill into scalable revenue opportunities — not just side projects.",
    cta: "If you're serious about building this correctly and efficiently, early access may be worth reviewing.",
    color: "from-violet-500 to-purple-400",
  },
  {
    id: "survival_freelancer",
    name: "The Survival Freelancer",
    emoji: "⚡",
    headline: "You're Already Doing This — Now It's About Consistency and Scale.",
    body: [
      "You've already crossed the hardest line: You've proven someone will pay you.",
      "Now the challenge usually becomes:",
    ],
    bullets: [
      "Predictable customer flow",
      "Pricing confidence",
      "Systems that remove chaos",
    ],
    solution: "NuFounders helps freelancers transition into real business owners with customer pipeline support, offer packaging, and marketplace distribution.",
    cta: "If you want to turn inconsistent income into reliable revenue, you may want to explore early cohort access.",
    color: "from-rose-500 to-pink-400",
  },
  {
    id: "emerging_founder",
    name: "The Emerging Founder",
    emoji: "👑",
    headline: "You're In Founder Mode — Now It's About Leverage.",
    body: [
      "You already think like a business owner. Your focus is likely shifting toward:",
    ],
    bullets: [
      "Scaling revenue",
      "Reducing founder bottlenecks",
      "Increasing leverage through systems and distribution",
    ],
    solution: "NuFounders combines AI-driven opportunity matching with marketplace exposure and founder-level growth tooling.",
    cta: "If you're looking for leverage — not just learning — early access may be a strong fit.",
    color: "from-amber-500 to-yellow-400",
  },
];

export function classifyArchetype(answers: SurveyAnswers): Archetype {
  const employment = answers.employment_status as string;
  const businessInterest = answers.considering_business as string;
  const urgency = answers.income_urgency as string;
  const motivation = answers.motivation as string;

  // 6. Emerging Founder - Self-employed or already operating
  if (
    employment === "self_employed" ||
    businessInterest === "operating_growing"
  ) {
    return archetypes.find((a) => a.id === "emerging_founder")!;
  }

  // 5. Survival Freelancer - Testing/earning inconsistently + immediate income need
  if (
    (businessInterest === "actively_exploring" ||
      businessInterest === "building_intentionally") &&
    (urgency === "asap" || urgency === "1_3_months") &&
    employment !== "laid_off_year"
  ) {
    return archetypes.find((a) => a.id === "survival_freelancer")!;
  }

  // 4. Pivoting Professional - Building intentionally + independence/control motivation
  if (
    (businessInterest === "building_intentionally" ||
      businessInterest === "actively_exploring") &&
    (motivation === "lifestyle_flexibility" ||
      motivation === "purpose_impact" ||
      motivation === "wealth_scaling" ||
      motivation === "career_security") &&
    (urgency === "3_6_months" || urgency === "about_a_year")
  ) {
    return archetypes.find((a) => a.id === "pivoting_professional")!;
  }

  // 3. Recently Displaced Rebuilder - Laid off + urgent income need
  if (
    employment === "laid_off_year" &&
    (urgency === "asap" || urgency === "1_3_months" || urgency === "3_6_months")
  ) {
    return archetypes.find((a) => a.id === "displaced_rebuilder")!;
  }

  // 2. Overwhelmed Starter - Interested but unclear + moderate timeline
  if (
    (businessInterest === "interested_unclear" ||
      businessInterest === "actively_exploring") &&
    urgency !== "exploring" &&
    urgency !== "not_income_driven"
  ) {
    return archetypes.find((a) => a.id === "overwhelmed_starter")!;
  }

  // 1. Curious Explorer - Just exploring or no urgency
  if (
    businessInterest === "exploring_only" ||
    businessInterest === "not_pursuing" ||
    urgency === "exploring" ||
    urgency === "not_income_driven"
  ) {
    return archetypes.find((a) => a.id === "curious_explorer")!;
  }

  // Default fallback based on employment
  if (employment === "laid_off_year") {
    return archetypes.find((a) => a.id === "displaced_rebuilder")!;
  }

  // Ultimate fallback
  return archetypes.find((a) => a.id === "curious_explorer")!;
}
