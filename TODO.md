# NuFounders Survey App — TODO

**Last Updated:** April 5, 2026
**Status:** All 7 Integration Phases Complete ✅ | Phase 8 Updates ✅ (Z.ai Migration, Final Screen Simplification, Email Pre-population, Webhook Enhancement)

---

## ✅ Recently Completed (April 5, 2026)

### AI Provider Migration (OpenAI → Z.ai GLM-5.1)
- [x] **Replaced OpenAI with Z.ai GLM-5.1** — `api/lib/ai.ts` now uses Z.ai Coding Plan endpoint (`https://api.z.ai/api/coding/paas/v4/chat/completions`) with `GLM-5.1` model instead of `gpt-4o-mini`.
- [x] **Reasoning model support** — Added `reasoning_content` fallback extraction for GLM-5.1 chain-of-thought responses. Increased `max_tokens` from 1200 to 4096 for reasoning headroom.
- [x] **JSON robustness** — Strengthened system prompt to demand raw JSON output. Added markdown code fence stripping for reasoning models that wrap JSON in backticks.
- [x] **Environment variable swap** — Uses `ZAI_API_KEY` instead of removed `OPENAI_API`.

### Final Screen Simplification
- [x] **Hidden detailed results** — Added `SHOW_DETAILED_RESULTS` feature flag in `ResultsView.tsx`. Wrapped archetype details, executive summary, badge, promo code, and referral link behind the flag (code preserved, not deleted).
- [x] **Thank you message** — Final screen now displays "Thank you, we will get back to you." with animated check icon. Personalized with user's name when available.
- [x] **Retake Survey preserved** — Retake button and confetti celebration remain visible on the final screen.

### Email Collection & Pre-population
- [x] **Email URL parameter** — `useSession.ts` now parses `?email=` from URL and pre-populates session email. Pre-populated email is stored in both localStorage and the database on session creation.
- [x] **Email field in UserInfoScreen** — Added required email input field (with validation) between name and phone fields. Field is hidden when email is pre-populated from invite URL.
- [x] **Session creation with email** — `api/session.ts` and `api/lib/db.ts` updated to accept and persist email on session creation.

### Webhook Enhancement
- [x] **Phone & SMS data in webhook** — `api/complete.ts` webhook payload now includes `phoneNumber` and `smsConsent` fields for follow-up communication support on the dashboard side.
- [x] **Removed redundant client-side webhook** — Eliminated duplicate client-side webhook call from `Index.tsx`. Server-side webhook from `api/complete.ts` is the canonical path with full DB access.

---

## 🟡 In Progress / Next Up

### Testing the April 5 Changes
- [ ] **Test Z.ai summary generation** — Complete a survey and verify AI executive summary generates correctly via Z.ai GLM-5.1 (check server logs for errors).
- [ ] **Test final screen display** — Verify final screen shows only "Thank you" message + Retake button (no archetype details, summary, badge, promo, or referral).
- [ ] **Test email pre-population** — Visit survey with `?email=test@example.com` and verify email field is NOT shown in UserInfoScreen. Visit without email param and verify email field appears and is required.
- [ ] **Test webhook payloads** — Complete survey and verify dashboard receives webhook with `phoneNumber` and `smsConsent` fields in Survey Analytics.
- [ ] **Test SMS follow-up flow** — Verify follow-up SMS is sent when survey is completed by a user with SMS consent and phone number.
- [ ] **Test email follow-up flow** — Verify follow-up email is sent when survey is completed by a user with an email (pre-populated or entered).

---

## 🟡 Open Tasks

### Code Cleanup

- [ ] **Remove unused `NavLink.tsx`** — `src/components/NavLink.tsx` is defined but never imported. Either integrate or delete.
- [ ] **Delete `App.css`** — Contains default Vite boilerplate CSS not imported anywhere.
- [ ] **Remove unused shadcn/ui components** — ~50 components installed, only ~10 used (`button`, `card`, `input`, `select`, `toast`, `toaster`, `tooltip`, `label`, `textarea`, `badge`). Run tree-shaking analysis and prune.
- [ ] **Fix question numbering comments** — `src/data/surveyQuestions.ts` skips Q11 in source comments. Renumber for clarity.

### Error Handling

- [ ] **Add React error boundary** — No `ErrorBoundary` wrapping the app. An unhandled error crashes to white screen. Use `react-error-boundary` or custom class component.

### Testing

- [ ] **Write real tests** — Only `expect(true).toBe(true)` exists. Vitest and `@testing-library/react` are installed.
  - Unit: `classifyArchetype()` with all rule paths
  - Component: `OptionCard`, `ProgressBar`, `WelcomeScreen`, `ResultsView`
  - Integration: Welcome → UserInfo → Survey → Results flow
  - E2E: Playwright or Cypress for full user journey

### Route Placeholder

- [ ] **`App.tsx` line 22** — Comment reads `{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}`. Add future routes (e.g., `/about`, `/admin`) or remove comment.

---

## 🔮 Future Enhancements

### Phase 8: Post-Launch Enhancements
- [ ] Logo Update (Sync from Dashboard repo)
- [x] ~~Email field added with pre-population~~ — Email is now collected (required) or pre-populated from `?email=` URL param. Hidden when pre-populated from invite link.
- [ ] Q#14 State Dropdown -> Searchable
- [ ] Final Page: Certificate -> Badge + QR Code (currently hidden behind feature flag)
- [x] ~~Webhook trigger to nufounders.com~~ — Implemented with awaited `fetch` + 5 s `AbortSignal.timeout` in `api/complete.ts` and `api/session.ts`
- [x] ~~OpenAI → Z.ai migration~~ — Switched from gpt-4o-mini to GLM-5.1 with reasoning model support
- [x] ~~Final screen simplification~~ — Hidden detailed results behind `SHOW_DETAILED_RESULTS` feature flag per John's feedback
- [ ] **Re-enable detailed results** — Set `SHOW_DETAILED_RESULTS = true` in `ResultsView.tsx` when ready to show archetype details, summary, badge, promo code, and referral link again

### High Priority

- [ ] **A/B testing framework** — Variant assignment for survey questions, with analytics tracking per variant
- [ ] **Performance optimization & bundle analysis** — Code splitting (`React.lazy` for ResultsView), Lighthouse CI, dependency audit via `npx depcheck`
- [ ] **Admin analytics dashboard frontend** — Funnel visualization (Recharts), retake comparison charts, drop-off heatmaps using `survey_events` data

### Medium Priority

- [ ] **Additional archetypes / survey questions** — More granular profiles for personalized guidance
- [ ] **Accessibility audit (WCAG 2.1 AA)** — ARIA labels on OptionCards, keyboard navigation for step transitions, focus management, color contrast ratios
- [ ] **Survey branching & personalization** — Conditional follow-up questions based on early answers (extend `SurveyQuestion` type with `showIf` rules)
- [ ] **Social sharing** — Generate shareable URL with archetype ID + dynamic OG meta tags for rich link previews
- [ ] **Internationalization (i18n)** — `react-i18next` for multi-language support. Extract strings from `surveyQuestions.ts`, `archetypes.ts`, `WelcomeScreen.tsx`, `ResultsView.tsx`

### Low Priority

- [ ] **PWA support** — `vite-plugin-pwa` for offline access and installability
- [ ] **Results PDF export** — `@react-pdf/renderer` or `html2canvas` + `jsPDF` for branded PDF download
- [ ] **React Query migration** — Move `useSession` fetch calls to TanStack React Query for caching and retry

---

## 🔧 Technical Debt

- [ ] Lint warnings for `@vercel/node` and `@neondatabase/serverless` in `api/analytics.ts` — IDE-only, works at runtime on Vercel
- [ ] `TanStack React Query` configured but only partially used — consider full adoption or removal
- [ ] Update CLAUDE.md to reflect Z.ai/GLM-5.1 (currently references OpenAI gpt-4o-mini)
- [ ] Update CLAUDE.md to document `?email=` URL parameter

---

## 💡 Suggested Next Steps

1. **Deploy and test Z.ai integration** — The AI provider swap is the highest-risk change. Deploy to Vercel and run a full survey completion to verify GLM-5.1 generates valid JSON summaries.
2. **Verify webhook data on dashboard** — After completing a survey, check the NuFounders dashboard Survey Analytics to confirm `phoneNumber` and `smsConsent` arrive in the webhook payload.
3. **Test email invite flow end-to-end** — Send a survey invite email from the dashboard, click through, and verify the email is pre-populated and not re-asked.
4. **Consider suppressing AI generation** — Since the executive summary is hidden, consider setting `SHOW_DETAILED_RESULTS` check in `Index.tsx` to skip the `generateResults()` API call entirely, saving Z.ai API costs.
5. **SMS provider integration** — SMS consent is collected and sent via webhook, but no SMS sending service (Twilio) is directly integrated in the survey app. Follow-up SMS is handled by the dashboard's webhook handler. Verify this path works.
6. **Re-enable features when ready** — When John is ready to show detailed results again, flip `SHOW_DETAILED_RESULTS = true` in `ResultsView.tsx`. All code is preserved.
