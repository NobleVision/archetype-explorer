import type { SurveyAnswers } from "./surveyQuestions";

/**
 * Generates a personalized 1-line CTA statement based on the user's
 * archetype, motivation, barrier, and urgency responses.
 */
export function getPersonalizedCta(
  archetypeId: string,
  answers: SurveyAnswers
): string {
  const motivation = answers.motivation as string | undefined;
  const barrier = answers.biggest_barrier as string | undefined;

  switch (archetypeId) {
    case "curious_explorer":
      if (barrier === "confidence_risk") {
        return "Based on your interest in entrepreneurship and your focus on building clarity and confidence before taking big risks — early access may be a strong fit.";
      }
      if (motivation === "purpose_impact") {
        return "Based on your interest in meaningful work and your early-stage exploration of entrepreneurship — early access may be a strong fit.";
      }
      return "Based on your curiosity about entrepreneurship and your current focus on exploring options before committing to income goals — early access may be a strong fit.";

    case "overwhelmed_starter":
      if (barrier === "choosing_idea") {
        return "Based on your desire to start something of your own and your focus on what to sell and how to price it — early access may be a strong fit.";
      }
      if (barrier === "business_setup") {
        return "Based on your interest in entrepreneurship and your need for clear structure and setup guidance — early access may be a strong fit.";
      }
      return "Based on your interest in starting a business and your focus on figuring out what to build and how to start — early access may be a strong fit.";

    case "displaced_rebuilder":
      if (motivation === "career_security") {
        return "Based on your focus on creating career stability and your need for faster paths to income — early access may be a strong fit.";
      }
      if (barrier === "financial_runway") {
        return "Based on your urgency around income and your concern about financial runway — early access may be a strong fit.";
      }
      return "Based on your need to generate income in the near term and your focus on finding customers or monetizing your skills quickly — early access may be a strong fit.";

    case "pivoting_professional":
      if (
        motivation === "lifestyle_flexibility" ||
        motivation === "career_security"
      ) {
        return "Based on your desire for career control and your focus on building something sustainable long term — early access may be a strong fit.";
      }
      if (barrier === "capacity_support") {
        return "Based on your serious commitment to entrepreneurship and your focus on building the right systems and strategy — early access may be a strong fit.";
      }
      return "Based on your commitment to building your own path and your focus on creating reliable income from your expertise — early access may be a strong fit.";

    case "survival_freelancer":
      if (barrier === "finding_customers") {
        return "Based on your current earning activity and your focus on getting a steady flow of customers — early access may be a strong fit.";
      }
      if (barrier === "choosing_idea") {
        return "Based on your current client work and your focus on improving pricing and income predictability — early access may be a strong fit.";
      }
      return "Based on the fact that you're already generating some income and your focus on making revenue more consistent and predictable — early access may be a strong fit.";

    case "emerging_founder":
      if (motivation === "wealth_scaling") {
        return "Based on your focus on long-term wealth and your commitment to growing something scalable — early access may be a strong fit.";
      }
      if (barrier === "capacity_support") {
        return "Based on your active business and your focus on building leverage and reducing founder workload — early access may be a strong fit.";
      }
      return "Based on your existing business activity and your focus on scaling revenue and building stronger systems — early access may be a strong fit.";

    default:
      return "Based on your responses, early access may be a strong fit.";
  }
}
