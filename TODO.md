# NuFounders — TODO

## 1. In Progress

Items identified from code comments and incomplete implementations currently in the codebase.

### ~~`index.html` — Document title still reads "Lovable App"~~ ✅ COMPLETED
- **Status**: Fixed. Title, description, OG tags, Twitter cards, and favicon all updated to NuFounders branding.

### ~~`index.html` — Open Graph title still reads "Lovable App"~~ ✅ COMPLETED
- **Status**: Fixed in the same update as above.

### ~~`index.html` — Meta description and OG image reference Lovable~~ ✅ COMPLETED
- **Status**: All Lovable references replaced with NuFounders branding.

### `App.tsx` — Route placeholder comment
- **File**: `src/App.tsx`, line 22
- **Comment**: `{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}`
- **Action**: Add any future routes (e.g., `/about`, `/admin`, `/results/:id`) above the catch-all, then remove or keep the comment as a guide.

---

## 2. Needs Completion

Gaps, dead code, and missing functionality identified during codebase review.

### Placeholder test — no real tests exist
- **File**: `src/test/example.test.ts`
- **Issue**: The only test in the project is `expect(true).toBe(true)`. No component, logic, or integration tests exist.
- **Action**: Write tests for `classifyArchetype()` (unit), `SurveyForm` navigation/skip logic (component), and the full Welcome → Survey → Results flow (integration). Vitest and `@testing-library/react` are already installed.

### `NavLink.tsx` — unused component
- **File**: `src/components/NavLink.tsx`
- **Issue**: This React Router `NavLink` wrapper is defined but never imported or rendered anywhere in the application.
- **Action**: Either integrate it into a navigation bar or remove it to reduce dead code.

### `App.css` — unused Vite boilerplate CSS
- **File**: `src/App.css`
- **Issue**: Contains default Vite starter styles (logo spin animation, layout rules) that are not imported by any file. `App.tsx` does not import `App.css`.
- **Action**: Delete the file or replace its contents with application-specific global styles.

### Question numbering gap — no Q11 in source data
- **File**: `src/data/surveyQuestions.ts`
- **Issue**: Questions are numbered Q1–Q10, then Q12–Q16 in the source code comments. There is no Q11 — the `education` question is labeled as Q12. The actual array is 0-indexed and contiguous (16 elements), so the survey works correctly, but the numbering in comments is inconsistent.
- **Action**: Renumber the comments to Q1–Q15 (or Q1–Q16 if a 16th question is added) for clarity.

### ~~No email validation on early access input~~ ✅ COMPLETED
- **Status**: Added Zod-based email validation in `SurveyForm.tsx` with inline error messages.

### ~~No data persistence or backend integration~~ ✅ COMPLETED
- **Status**: Full backend implemented with Vercel serverless functions (`/api/session`, `/api/complete`), Neon PostgreSQL integration, session persistence, promo code generation, and webhook notifications. Uses `useSession` hook for dual localStorage + API persistence.

### No error boundaries
- **Issue**: The application has no React error boundaries. An unhandled error in any component will crash the entire app with a white screen.
- **Action**: Add an `ErrorBoundary` component wrapping the main content in `App.tsx`. Consider using `react-error-boundary` or a custom class component.

### ~~TanStack React Query configured but unused~~ — partially used
- **Status**: React Query is now available for future API calls. The `useSession` hook uses native fetch for simplicity, but React Query can be leveraged for cached queries when building the admin dashboard.

### Many shadcn/ui components installed but unused
- **File**: `src/components/ui/` (~50 component files)
- **Issue**: The project installs a large set of shadcn/ui components (accordion, alert-dialog, avatar, calendar, carousel, chart, collapsible, command, context-menu, dialog, drawer, dropdown-menu, hover-card, menubar, navigation-menu, pagination, popover, resizable, scroll-area, sheet, sidebar, skeleton, slider, switch, table, tabs, toggle, toggle-group, etc.) but only uses a handful (`button`, `card`, `input`, `select`, `toast`, `toaster`, `tooltip`, `label`, `textarea`, `badge`).
- **Action**: Remove unused components to reduce the codebase footprint, or keep them if future features will use them. Run a tree-shaking analysis to confirm which are bundled.

---

## 3. Suggested Future Enhancements

### Backend Integration / Data Persistence
- **What**: Connect the survey to a backend service to store responses, archetype results, and email addresses.
- **Why**: Currently all data is lost on page refresh. Persisting data enables analytics, follow-up emails, and cohort management.
- **How**: Use Supabase, Firebase, or a custom REST/GraphQL API. Leverage the already-installed TanStack React Query for data fetching and mutations.
- **Files involved**: `src/App.tsx` (QueryClient config), `src/pages/Index.tsx` (submit handler), new `src/api/` or `src/services/` directory.

### Analytics and Tracking
- **What**: Add event tracking for survey starts, completions, drop-off points, archetype distributions, and email capture rates.
- **Why**: Understanding user behavior is critical for optimizing the survey funnel and validating archetype distribution.
- **How**: Integrate Google Analytics 4, Mixpanel, PostHog, or a similar analytics platform. Fire events at key moments: survey start, each question answered, survey completion, archetype assigned, retake.
- **Files involved**: `src/components/survey/SurveyForm.tsx`, `src/pages/Index.tsx`, `src/components/survey/ResultsView.tsx`.

### Additional Archetypes or Survey Questions
- **What**: Expand the classification system with more nuanced archetypes or additional survey questions.
- **Why**: The current 6 archetypes cover broad categories. More granular profiles could provide more personalized guidance.
- **How**: Add new archetype objects to `src/data/archetypes.ts`, extend the classification rules in `classifyArchetype()`, and add new questions to `src/data/surveyQuestions.ts`.

### Accessibility Improvements
- **What**: Audit and improve WCAG 2.1 AA compliance across the application.
- **Why**: Ensures the survey is usable by people with disabilities and meets legal accessibility requirements.
- **How**: Add ARIA labels to interactive elements, ensure keyboard navigation works for all question types, add focus management during step transitions, ensure sufficient color contrast ratios, and add screen reader announcements for progress changes.
- **Files involved**: `src/components/survey/OptionCard.tsx`, `src/components/survey/SurveyForm.tsx`, `src/components/survey/ProgressBar.tsx`, `src/components/survey/ResultsView.tsx`.

### Performance Optimizations
- **What**: Reduce bundle size and improve load times.
- **Why**: The app includes many unused shadcn/ui components and dependencies that increase bundle size.
- **How**: Remove unused components from `src/components/ui/`, audit dependencies with `npm ls` or `npx depcheck`, enable code splitting with `React.lazy()` for the results view, and add Lighthouse CI to the build pipeline.

### Testing (Unit, Integration, E2E)
- **What**: Build a comprehensive test suite.
- **Why**: The only existing test is a placeholder. No business logic, components, or user flows are tested.
- **How**:
  - **Unit tests**: Test `classifyArchetype()` with all rule paths and edge cases. Test skip logic in `SurveyForm`.
  - **Component tests**: Test `OptionCard`, `ProgressBar`, `WelcomeScreen`, and `ResultsView` rendering.
  - **Integration tests**: Test the full Welcome → Survey → Results flow with `@testing-library/react`.
  - **E2E tests**: Add Playwright or Cypress for browser-level testing of the complete user journey.
- **Files involved**: `src/test/`, `src/data/archetypes.ts`, `src/components/survey/*.tsx`, `vitest.config.ts`.

### Internationalization / Localization (i18n)
- **What**: Support multiple languages for the survey and results.
- **Why**: Expands the potential user base beyond English speakers.
- **How**: Integrate `react-i18next` or a similar i18n library. Extract all user-facing strings from `surveyQuestions.ts`, `archetypes.ts`, `WelcomeScreen.tsx`, and `ResultsView.tsx` into translation files. Add a language selector to the welcome screen.

### Social Sharing of Results
- **What**: Allow users to share their archetype result on social media or via a unique link.
- **Why**: Organic sharing drives new users to the survey and increases brand awareness.
- **How**: Generate a shareable URL with the archetype ID (e.g., `/results/curious_explorer`). Add Open Graph meta tags dynamically for rich link previews. Include share buttons for Twitter/X, LinkedIn, and copy-to-clipboard.
- **Files involved**: `src/components/survey/ResultsView.tsx`, `src/pages/Index.tsx` (new route), `index.html` (dynamic OG tags).

### Progressive Web App (PWA) Support
- **What**: Add a service worker and web app manifest for offline access and installability.
- **Why**: Allows users to take the survey offline or install it as a native-like app on mobile devices.
- **How**: Use `vite-plugin-pwa` to generate a service worker and manifest. Configure caching strategies for static assets.

### Admin Dashboard
- **What**: Build an admin interface to view aggregated survey results, archetype distributions, and email signups.
- **Why**: Provides the NuFounders team with insights into user demographics and survey performance without direct database access.
- **How**: Add a protected `/admin` route with charts (Recharts is already installed), tables, and filters. Requires backend integration first.

### Survey Branching and Personalization
- **What**: Add more sophisticated conditional logic so different archetypes see different follow-up questions.
- **Why**: Increases survey relevance and reduces fatigue for users whose path is already clear.
- **How**: Extend the `SurveyQuestion` type with conditional display rules (e.g., `showIf: { questionId: string, values: string[] }`). Update `SurveyForm` navigation logic to evaluate these rules dynamically.
- **Files involved**: `src/data/surveyQuestions.ts`, `src/components/survey/SurveyForm.tsx`.

### Results PDF Export
- **What**: Allow users to download their archetype results as a branded PDF.
- **Why**: Gives users a tangible takeaway they can reference later or share with mentors/advisors.
- **How**: Use a library like `@react-pdf/renderer` or `html2canvas` + `jsPDF` to generate a styled PDF from the `ResultsView` content.

---

## 4. Integration Tasks (Remaining Phases)

### Phase 4 — AI Executive Summary & Certificate
- [ ] Generate personalized AI summary using OpenAI/Z.ai based on archetype + answers
- [ ] Create branded certificate image via Cloudinary text overlay
- [ ] Store certificate URL and AI summary in `survey_sessions` table
- [ ] Display certificate and summary in `ResultsView`

### Phase 5 — Points System Dashboard (NuFounders Main App)
- [ ] Build promo code redemption UI component on the Dashboard page
- [ ] Display points balance and transaction history
- [ ] Add animated points counter with confetti on successful redemption
- [ ] Show referral link generation on user profile page

### Phase 6 — Admin Dashboard Enhancements (NuFounders Main App)
- [ ] Build survey sessions table in admin dashboard
- [ ] Show archetype distribution charts (Recharts already installed)
- [ ] Display promo code redemption metrics
- [ ] Real-time webhook notification feed for admins

### Phase 7 — Analytics & Polish
- [ ] Add event tracking for survey funnel (start, each step, completion, drop-off)
- [ ] Survey retake tracking and comparison
- [ ] A/B testing framework for survey questions
- [ ] Performance optimization and bundle analysis
