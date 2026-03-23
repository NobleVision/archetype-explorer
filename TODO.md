# NuFounders Survey App — TODO

**Last Updated:** February 13, 2026
**Status:** All 7 Integration Phases Complete ✅

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
- [ ] Remove Email field (Keep Name)
- [ ] Q#14 State Dropdown -> Searchable
- [ ] Final Page: Certificate -> Badge + QR Code
- [x] ~~Webhook trigger to nufounders.com~~ — Implemented with awaited `fetch` + 5 s `AbortSignal.timeout` in `api/complete.ts` and `api/session.ts`

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
