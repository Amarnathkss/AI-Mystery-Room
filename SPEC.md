# AI Mystery Room — Product & Engineering Specification

> **Document status:** Source of truth for implementation  
> **Version:** 1.0  
> **Last updated:** 2026-10-25  
> **Audience:** Codex, developers, reviewers  
> **Product type:** Responsive MERN web application powered by Gemini

---

## 0. Instructions for Codex

This file is the canonical specification for AI Mystery Room. Read it before implementing a feature and keep implementation aligned with it.

1. Treat the requirements, schemas, routes, safety rules, and acceptance criteria in this file as authoritative.
2. Do not silently remove, reinterpret, or invent product behavior. If a genuine conflict is discovered, document it and update this file before building a different behavior.
3. Build in small, testable milestones. At the end of each milestone, run linting, type checking, tests, and the relevant build. Do not leave the app in a knowingly broken state.
4. Create a reliable **mock AI provider** first. The website must be runnable and testable without a Gemini API key. The mock provider must return internally consistent, deterministic cases for development and automated tests.
5. Gemini API keys and all other secrets must remain on the server. Never expose them in Vite variables, browser bundles, API responses, logs, or committed files.
6. Do not expose the culprit, solution, private clue annotations, evaluation rubric, or generation prompt to the client before an accusation is submitted.
7. All evidence must be presented as fictional, AI-generated game content. Never pass game evidence off as genuine messages, real CCTV footage, or real-world forensic evidence.
8. Prefer simple, maintainable implementations over premature abstraction. Still preserve the provider interfaces and public/private data boundary specified below.
9. Use the current official Google GenAI SDK and current model documentation. Model IDs and provider API methods change; keep them configurable and do not use retired model IDs or the legacy `@google/generative-ai` package.
10. Update the README with actual setup instructions and keep `.env.example` in sync with the code. `SPEC.md` remains the product and behavior authority.

## 1. Product overview

### 1.1 Product name

**AI Mystery Room**

### 1.2 Product concept

A user submits a short fictional scenario, premise, or story seed. The application expands it into a playable investigation. The backend uses Gemini to create a coherent mystery with a culprit, a cast of suspects, a timeline, and evidence. The player inspects the evidence and chooses the person they believe is responsible. The application then reveals the solution and explains how the clues fit together.

The evidence board can contain:

- Fictional chat transcripts rendered in an instant-message-style interface.
- AI-generated still images, such as a room, object, location, or visual clue.
- AI-generated CCTV-style video clips where the configured Gemini video model is available.
- CCTV incident logs, timestamps, transcripts, and reconstructed stills as an explicit fallback if video generation is unavailable.
- Other text evidence, such as a receipt, note, access log, timeline, or witness statement.

All clues must originate from a canonical case plan. The content generator must not invent unrelated evidence after the solution has been established.

### 1.3 Core user experience

1. The user opens the landing page.
2. The user enters a short story seed and chooses difficulty and tone.
3. The server creates a case-generation job and returns a case ID.
4. The UI presents generation progress while the backend creates and validates the case and evidence.
5. The user opens the investigation workspace and reviews the suspects and evidence.
6. The user selects one suspect, optionally writes a short explanation, and submits a final accusation.
7. The application locks the attempt and displays whether the answer is correct, the culprit, the motive, the timeline, the decisive clues, and explanations for red herrings.
8. The case appears in the user's recent cases list for the current guest session.

### 1.4 Product principles

- **Fair mystery:** The final solution must be supported by visible evidence, not by hidden information or arbitrary model judgment.
- **Consistency first:** Generate the underlying truth and timeline before generating evidence artifacts.
- **Evidence is interactive:** Chat logs, images, and CCTV content should feel like investigation artifacts, not a plain list of AI paragraphs.
- **No spoilers before accusation:** Server responses must not leak private solution data.
- **Graceful media fallback:** Slow or unavailable media generation must not make a case permanently unplayable.
- **Fictional by design:** Each case and every artifact must be clearly labelled as AI-generated fictional content.
- **Responsive and accessible:** The evidence board must work on desktop, tablet, and mobile.

## 2. Fixed decisions and assumptions for version 1

These choices remove ambiguity for implementation. They can change only through an explicit revision to this spec.

| Topic | Version 1 decision |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose |
| AI provider | Google Gemini API through the official `@google/genai` SDK |
| Image generation | Configurable Gemini image-generation model through a server-side provider adapter |
| Video generation | Configurable Gemini video-generation model through a server-side provider adapter |
| Authentication | No account registration in v1. Use a secure, random guest-session cookie to scope a user's cases. |
| Language | English UI and English-generated cases in v1 |
| Input | Text scenario only; no user-uploaded evidence in v1 |
| Scenario size | 50–1,200 characters after trimming; reject blank or oversized input |
| Difficulty | Easy, Standard, Hard |
| Tone | Cozy, Noir, Suspense, Campus, Workplace, or Custom (short text) |
| Suspects | 4–6 fictional suspects |
| Evidence count | 6–8 items per playable case, with a target of 7 |
| Evidence coverage | Chat evidence, at least one visual image item, and one CCTV/video item or clearly labelled CCTV fallback item |
| Accusations | One final accusation per case in v1; no resetting an attempt in the UI |
| Scoring | 100 for a correct accusation, 0 for an incorrect accusation. No AI-graded reasoning score in v1. |
| Sharing | No public share links in v1; cases are guest-session private |
| Retention | Delete cases and stored media 30 days after creation unless deleted earlier by the user |
| UI feedback | Toast messages for recoverable actions/errors; inline states for loading, generation, empty, and fatal states |
| Icons | `lucide-react` |
| Notifications | Poll case generation status; no WebSocket requirement in v1 |
| Deployment | Keep deployment platform-neutral; support environment configuration and a separate media-storage adapter |

### 2.1 Difficulty configuration

- **Easy:** 4 suspects, 6 evidence items, direct but still reasoned clues, at least 2 independently useful decisive clues.
- **Standard:** 5 suspects, 7 evidence items, a moderate timeline puzzle and one explainable red herring.
- **Hard:** 6 suspects, 8 evidence items, more overlapping motives and a subtler timeline, while remaining logically solvable.

Difficulty changes the number of suspects, clue density, and complexity. It must not make the correct answer depend on guessing or hidden facts.

### 2.2 Scope boundary

The application is a fictional mystery game, not a police tool, forensic platform, real-person investigation service, or evidence-authentication system. Never claim that AI-generated artifacts are reliable evidence of an actual event.

## 3. Goals and non-goals

### 3.1 Goals

- Turn a user-provided story seed into a complete, coherent mystery.
- Generate a consistent suspect cast, timeline, and evidence set.
- Support rich evidence formats, including chat transcripts, AI-generated images, and AI-generated CCTV-style video when configured.
- Allow users to inspect all evidence before submitting an accusation.
- Reveal a coherent solution after submission.
- Save recent cases within a guest session.
- Keep provider credentials, solution data, and generation internals on the server.
- Keep the full application usable without external AI credentials by using a mock provider in development and tests.

### 3.2 Non-goals for v1

- User registration, social login, profiles, public leaderboards, or multiplayer rooms.
- Real-time co-op investigation or chat between players.
- Real-world police reports, real accusations, user-uploaded photos/videos, or investigation of real people.
- Public case publishing or link-based sharing.
- Payments, subscriptions, subscriptions quotas UI, or advertising.
- AI grading of a player's written reasoning.
- User-created custom evidence after a case has been generated.
- Native mobile applications.

## 4. User stories

- **US-01:** As a player, I can describe a fictional scenario so the game can build a mystery around it.
- **US-02:** As a player, I can choose a difficulty and story tone to customize the challenge.
- **US-03:** As a player, I can see generation progress and understand whether the case is being prepared or has failed.
- **US-04:** As a player, I can review 4–6 suspect profiles without seeing the answer.
- **US-05:** As a player, I can open chat, image, document, and CCTV evidence and inspect timestamps and source details.
- **US-06:** As a player, I can review all evidence before making my final accusation.
- **US-07:** As a player, I can select one suspect and submit an optional explanation.
- **US-08:** As a player, I can see the final verdict, solution, motive, decisive clues, and red-herring explanations after submission.
- **US-09:** As a returning guest, I can see my recent cases in the same browser session.
- **US-10:** As a player, I can delete one of my cases and its associated media.
- **US-11:** As a player, I am clearly told that case evidence is fictional and AI-generated.

## 5. Functional requirements

Priority meanings: **P0** = required for the first complete product; **P1** = desirable improvement that must not block P0.

### FR-001 — Landing and case creation (P0)

- Show the product name, a concise description of the gameplay, a primary “Create a Mystery” action, and a small set of example story prompts.
- Include a visible disclosure that the cases and evidence are fictional and AI-generated.
- The create form includes scenario text, difficulty, tone, and an optional custom-tone field.
- Disable submission while input is invalid or the request is in progress.
- On success, navigate to the case-generation/investigation route using the returned case ID.

**Acceptance criteria:** Blank input, fewer than 50 characters, and more than 1,200 characters are rejected with clear feedback. A valid request creates one case and one generation job only once per user action.

### FR-002 — Case generation and progress (P0)

- Generation runs asynchronously; an HTTP request must not remain open for the entire media-generation workflow.
- Store job status and progress on the server.
- Expose safe progress fields to the client: stage label, percentage (coarse is acceptable), and friendly status text.
- Poll every 2.5 seconds initially; back off to a maximum of 6 seconds after repeated polls. Stop polling when the case is ready or failed.
- Allow the user to leave and return to a case; generation status must survive a page refresh.
- Retry transient provider failures with bounded retries. Never retry indefinitely.

**Acceptance criteria:** A browser refresh does not lose the case ID or job state. Failure renders a retry or return-home action and does not expose stack traces, prompts, API keys, or raw provider errors.

### FR-003 — Canonical case plan (P0)

- Before evidence generation, create a canonical case plan (“case truth”) containing the actual culprit, motive, method, timeline, suspect facts, expected clues, and red herrings.
- Validate that the culprit refers to a real suspect ID and that all evidence references a valid case fact.
- Keep truth fields private to the backend until accusation submission.
- Validate the plan programmatically and ask the model to repair it at most once if it fails validation. If still invalid, fail the generation job safely.

### FR-004 — Suspect board (P0)

- Display 4–6 suspects as distinct cards or list items.
- Each visible profile contains name, role/relationship to the incident, short biography, stated motive/context, and public alibi where applicable.
- Do not display private clue tags, the culprit flag, hidden facts, or solution-specific reasoning before submission.
- Suspects must be fictional and unique within the case.

### FR-005 — Evidence board (P0)

- Display 6–8 evidence items; target 7.
- Each item includes a title, evidence type, in-world date/time if relevant, source label, a concise non-spoiler summary, and an “Open evidence” interaction.
- Include a filter for All, Chats, Images, CCTV, and Documents.
- Let the player open and close an evidence detail view without losing the current investigation state.
- Evidence can be marked as reviewed in local UI state. This is optional UX and must not affect the answer or scoring.
- Evidence metadata and generated media must be associated with the relevant case and stored safely.

**Evidence type requirements:**

1. **Chat transcript:** Show sender, timestamp, message, and group/individual conversation context. Render messages as a designed mock chat UI. Do not create a screenshot pretending to be a genuine exported WhatsApp record or use official WhatsApp branding as proof of authenticity.
2. **Image:** Show an AI-generated image with a caption, source, and context. The displayed caption must not reveal the hidden clue annotation.
3. **CCTV/video:** Show a player-friendly video player for a generated clip when the video provider succeeds. Include recording time, camera/source name, and a fictional watermark/label. If generation is unavailable, show a clearly labelled CCTV incident log plus generated keyframe/reconstruction stills when available. Do not describe fallback text as a video clip.
4. **Document/log:** Render a readable artifact such as an access log, note, receipt, or timeline excerpt.

### FR-006 — Evidence integrity and fairness (P0)

Every case must satisfy all of the following before becoming playable:

- The culprit is one of the suspects.
- At least two independently useful clues support the correct solution.
- At least one clue meaningfully rules against or contradicts a false suspect's public alibi, or otherwise distinguishes the culprit from alternatives.
- Red herrings are explainable in the final reveal and do not require the player to ignore a factual contradiction.
- No decisive clue depends solely on tiny, unreadable text or a visual detail that the generated media may not reliably render.
- The visible evidence set supports one best answer. Other suspects may be plausible but must not be equally correct based on the available facts.
- Clue timestamps, messages, stated alibis, the case timeline, and the solution must agree.
- Generated media must not introduce a visual fact that directly contradicts the canonical case plan. For clue-bearing assets, run a consistency check where supported. Retry a failed asset once, then degrade to a truthful text/reconstruction fallback.

If fairness validation fails after one repair pass, do not publish the case as `READY`. Mark the job failed with a safe internal error code and offer the player another attempt to generate a case.

### FR-007 — Accusation (P0)

- The player selects one suspect and may optionally enter a reasoning note of up to 600 characters.
- The final confirmation dialog must identify the selected suspect and state that the decision cannot be changed for this case.
- The server verifies that the case belongs to the guest session, is ready, the suspect belongs to the case, and no accusation already exists.
- The server calculates correctness by comparing the selected suspect ID to the hidden culprit ID. Do not ask a model to decide correctness.
- Save the attempt and lock the case to one final accusation.
- Duplicate submissions must not create multiple attempts. Use an atomic update or equivalent concurrency-safe mechanism.

### FR-008 — Reveal and debrief (P0)

After the final accusation is accepted, reveal:

- Whether the accusation was correct.
- The culprit's name and profile.
- The motive and method, within the fictional story's boundaries.
- A concise chronological timeline.
- The decisive evidence, with links back to the relevant evidence items.
- Why each red herring was misleading but explainable.
- A brief concluding explanation showing how the evidence connects.
- Accuracy score: 100 when correct and 0 when incorrect.
- The optional reasoning note, if the player supplied one.

The reveal must be constructed from the validated stored solution. It must not ask Gemini to invent a new solution after the accusation.

### FR-009 — Recent cases (P0)

- Show cases owned by the current guest session, newest first.
- List title, creation date, state (Generating, Ready, Failed, Solved/Accused), difficulty, and whether the attempt was correct if completed.
- Allow opening a case and deleting a case.
- A case that is still generating resumes at its existing generation state; do not create another case automatically.
- Do not expose another guest's cases by enumerating IDs.

### FR-010 — Error and empty states (P0)

Provide consistent states for invalid input, missing case, unauthorized case, rate limiting, provider timeout, generation failure, unavailable media, already-submitted accusation, and network failure. Every error must have a clear next step when possible.

### FR-011 — Responsive, accessible interaction (P0)

- Support screen widths from 360 px upward.
- On desktop, use a split investigation layout with a persistent suspect panel and an evidence workspace.
- On mobile, use tabs or a stacked layout for Suspects, Evidence, and Timeline; avoid horizontal overflow.
- All actions must be keyboard operable and have visible focus styles.
- Use semantic headings, accessible form labels, alt text for images, captions/descriptive fallback for video, and adequate contrast.
- Observe WCAG 2.2 AA as the accessibility target.

### FR-012 — Privacy and fictional-content disclosure (P0)

- Display “Fictional case • AI-generated evidence” near the case title and evidence details.
- User-supplied text is scenario input, not permission to investigate actual people.
- If the input names identifiable real people or requests deceptive evidence about a real person, transform the scenario into a fictionalized version with invented names and details, or reject it with a helpful message. Never make a real person the culprit in an allegation-like scenario.
- Avoid real contact details, exact private addresses, real account identifiers, and identifying information about private individuals.
- Do not generate documents intended to be passed off as genuine police, legal, medical, financial, or telecom records. In-world mock artifacts must remain visibly fictional in the product UI.

### FR-013 — Case deletion and retention (P0)

- Deleting a case removes the case document, its generation jobs, its accusation, and its stored media assets if they are not shared elsewhere.
- Cases expire 30 days after creation in v1. Expiry cleanup must remove database records and associated media objects.
- Do not store a guest's raw session cookie value in MongoDB; store a one-way hash of it.

### FR-014 — AI provider abstraction (P0)

- Implement `MockMysteryProvider` and `GeminiMysteryProvider` behind a common application interface.
- Implement separate text, image, and video capabilities or clearly separated methods within the same provider adapter.
- Each provider method has typed inputs and outputs and translates provider-specific errors into application error codes.
- Provider/model identifiers come from environment configuration, not inline strings scattered through the application.
- If Gemini media generation is unavailable, the text-based core must still work, and the UI must label the fallback honestly.

### FR-015 — Generation usage limits (P0)

- Limit story input to 1,200 characters.
- Limit each guest session to at most 2 active generation jobs at once.
- Rate-limit case creation per session and IP. Use conservative defaults in configuration and document how to tune them.
- Bound retries for text and media generation. Do not allow an accidental infinite regeneration loop.
- Keep the target generation workflow cost-aware: one canonical case-plan generation, at most one repair pass, one image-generation attempt plus one retry, and one video-generation attempt plus one retry per case.

## 6. UX and visual design specification

### 6.1 Visual direction

Use a **premium detective dossier / modern noir** aesthetic rather than a generic SaaS dashboard.

- Main background: deep charcoal/navy.
- Evidence surfaces: warm off-white or dark slate with clear contrast.
- Accent: restrained brass/gold for focus, evidence highlights, and key actions.
- Secondary accent: muted red only for warnings or failed states; do not rely on color alone to communicate meaning.
- Use subtle shadows, thin borders, restrained gradients, and short transitions. Avoid heavy animated backgrounds that distract from reading evidence.
- Typography should prioritize legibility; use one display face for headings and a highly readable sans-serif for body content. If external fonts are unavailable, use sensible system fallbacks.
- Use `lucide-react` for icons. Use `cursor-pointer` and visible hover/focus states for interactive elements.
- Use toast notifications for operation feedback, but keep important errors and generation progress inline as well.

### 6.2 Required pages and routes

| Route | Purpose |
|---|---|
| `/` | Landing page and create-mystery CTA |
| `/create` | Scenario/difficulty/tone form |
| `/cases` | Recent cases for the current guest session |
| `/cases/:caseId` | Case generation state and investigation workspace |
| `*` | Friendly not-found page |

Do not create a separate public result/share route in v1. The result appears inside the owned case after an accusation is submitted.

### 6.3 Landing page

Required elements:

- AI Mystery Room branding.
- Headline communicating “Your story. A mystery to solve.” or equivalent.
- Short description: submit a fictional scenario, examine AI-created clues, and identify the culprit.
- Primary CTA: “Create a Mystery”.
- Secondary link: “Recent Cases”.
- A compact sample mystery preview with fictional suspects/evidence labels.
- Persistent fictional/AI-generated content disclosure.

### 6.4 Create form

Fields:

- Scenario text area (required, 50–1,200 characters) with live character count.
- Difficulty segmented control: Easy / Standard / Hard.
- Tone selector: Cozy / Noir / Suspense / Campus / Workplace / Custom.
- Custom tone text appears only when Custom is selected, maximum 40 characters.
- Submit button: “Build My Mystery”.
- Inline validation and brief note that generation may take a little time, especially when visual evidence is enabled.

### 6.5 Generation experience

Show a stepper or status list with these user-friendly phases:

1. Reading the scenario.
2. Designing suspects and timeline.
3. Building evidence.
4. Checking clue consistency.
5. Preparing the investigation.

The server can use internal phase names, but the client may only display safe, coarse statuses. Do not fake a completion percentage that implies precise model progress. If progress is indeterminate, use a staged animation and status text.

### 6.6 Investigation workspace

Required layout:

- Header row with case title, difficulty, incident context, status, and fictional/AI-generated disclosure.
- Suspect area with suspect profile cards and a “Review evidence before accusing” reminder.
- Evidence area with type filters and evidence cards.
- Evidence detail drawer/modal that supports chat transcript, image, video, and document views.
- Timeline view or timeline tab for public case events. Do not reveal hidden truth in this timeline.
- Accusation panel with suspect selection, optional reasoning note, and “Make Final Accusation” action.
- Confirmation dialog before locking the attempt.

Never preselect the correct suspect, visually emphasize the culprit, or sort clues in a way that exposes the answer.

### 6.7 Result state

Use clear, distinct correct/incorrect feedback without relying only on red/green color. Display the full solution explanation, decisive evidence links, red-herring explanations, and the player's final selection. Once completed, replace the accusation form with the result; do not allow a second attempt.

### 6.8 Loading, empty, and error states

- Recent cases empty state: explain that generated cases will appear here and include the create CTA.
- Evidence loading: skeleton cards with labels, not a blank screen.
- Media unavailable: keep the evidence item visible with a clearly labelled fallback explanation.
- Case failed: explain that generation did not finish and offer “Try again” as a new generation, not a silent reuse of a partially inconsistent case.
- Unknown/expired case: show a friendly message and navigation back to the recent cases page.

## 7. Technical architecture

### 7.1 Monorepo layout

Use npm workspaces with a layout similar to this. Names can be adjusted slightly, but responsibilities should remain separate.

```text
ai-mystery-room/
├── SPEC.md
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── docker-compose.yml           # optional local MongoDB/Redis services if selected
├── client/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── app/                 # router, providers, global shell
│       ├── components/          # reusable UI primitives
│       ├── features/
│       │   ├── create-case/
│       │   ├── case-list/
│       │   ├── investigation/
│       │   └── result/
│       ├── hooks/
│       ├── lib/                 # API client, formatters
│       ├── styles/
│       └── types/
├── server/
│   ├── package.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       ├── middleware/          # guest session, validation, rate limits, errors
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       │   ├── cases/
│       │   ├── generation/
│       │   ├── evidence/
│       │   ├── scoring/
│       │   └── storage/
│       ├── providers/
│       │   └── gemini/          # official SDK wrapper and model-specific adapters
│       ├── jobs/                # durable async generation workers
│       ├── models/               # Mongoose models
│       ├── schemas/              # Zod request/domain schemas
│       ├── utils/
│       └── tests/
├── shared/
│   ├── package.json
│   └── src/                     # shareable DTOs and schema-safe types
└── tests/                       # cross-package acceptance/integration tests if needed
```

Keep client-safe DTOs in `shared` only if the workspace setup stays straightforward. The server remains the authority for authorization, private data, validation, and scoring.

### 7.2 Frontend stack

- React + Vite + TypeScript.
- Tailwind CSS for styling.
- React Router for routing.
- TanStack Query for server state and polling, or a comparably small typed API-state layer if that materially simplifies the implementation.
- `lucide-react` for icons.
- `react-hot-toast` (or one consistent toast library) for transient operation feedback.
- A typed `fetch` wrapper for requests and normalized API errors.

Do not place the Gemini API key or server-only secrets in any `VITE_*` environment variable.

### 7.3 Backend stack

- Node.js + Express + TypeScript.
- MongoDB + Mongoose.
- Zod for request and domain-boundary validation.
- `@google/genai` for the official Google GenAI SDK.
- A background worker/queue for long-running case and media generation. Prefer BullMQ + Redis for robust job handling; if a smaller MongoDB-backed worker is chosen, document how leases, duplicate jobs, retries, and worker crashes are handled before replacing this choice.
- A storage interface for generated media: local disk in development and an S3-compatible/object-storage provider in production. Never store binary media in MongoDB documents.
- Structured request/error logging with request IDs. Do not log API keys, raw session cookies, or full hidden solutions.

### 7.4 Suggested supporting libraries

Use current compatible versions when implementing; avoid stale version pins in this spec.

- `mongoose`, `zod`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit` or an equivalent rate limiter.
- `bullmq` and `ioredis` if BullMQ is used.
- `concurrently` for local scripts if useful.
- `vitest` for unit/integration tests, `supertest` for API tests, and React Testing Library for component tests.

### 7.5 Provider/model configuration

Use environment variables for model IDs and feature flags. As of the date of this spec, Google's official model catalog lists `gemini-3.8-flash` as a stable text model, `gemini-nano-banana-2.1` for image generation, and `gemini-omni-1.1-flash` for video generation. These are configuration defaults, not identifiers to scatter through source code. Verify current availability, SDK methods, quotas, pricing, and supported modalities against the official documentation when implementing or deploying.

- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL=gemini-3.8-flash`
- `GEMINI_IMAGE_MODEL=gemini-nano-banana-2.1`
- `GEMINI_VIDEO_MODEL=gemini-omni-1.1-flash`
- `AI_PROVIDER=mock` in local development; `gemini` when real generation is enabled
- `ENABLE_IMAGE_GENERATION=true|false`
- `ENABLE_VIDEO_GENERATION=true|false`

Use the official `@google/genai` package. Prefer the current documented API and the structured-output capability supported by the selected model/API. Do not depend on free-form JSON alone; validate every response with Zod, and use repair/retry only within the defined limits.

### 7.6 Async generation workflow

1. Validate and normalize the user input.
2. Create a `MysteryCase` with status `QUEUED` and a `GenerationJob`.
3. Return `202 Accepted` with the case ID and initial status.
4. Worker creates the canonical case plan.
5. Worker validates the plan and repairs it at most once.
6. Worker creates the visible suspect profiles and text evidence from the plan.
7. Worker generates one still image and one CCTV/video asset when enabled and configured.
8. Worker stores media immediately in application storage; do not rely on temporary remote model URLs.
9. Worker validates evidence references, timestamps, clue coverage, and solution consistency. Run a vision-based asset consistency check where supported.
10. If generated video is unavailable or inconsistent after a bounded retry, save a clearly labelled CCTV fallback item and any available generated keyframe/reconstruction. Do not falsely label a still or text log as video.
11. Run the final fairness validator. Only set the case to `READY` when minimum playable-case requirements are met.
12. Update job status and expose a safe progress summary through the case API.

If text generation or fairness validation fails, do not make the inconsistent case playable. A failed job can be reattempted as a new generation request using the original user prompt and settings, with a new case/job record or an explicitly implemented retry action that is idempotent.

### 7.7 Storage and media access

- Store media binaries outside MongoDB. Store only media metadata and an object key in MongoDB.
- Use opaque, non-guessable keys/IDs.
- Serve media only after verifying the requesting guest owns the case. Do not expose permanent public buckets or raw storage credentials.
- Set correct MIME types and safe caching headers.
- Validate file type and file size on outputs before storing/serving them.
- Delete associated media when a case is deleted or expires.
- Generated videos must be downloaded into durable application storage promptly after completion because provider-side retention can be time-limited.

## 8. Data model

Use Mongoose schemas and TypeScript domain types. Add indexes for ownership, status, and job lookup. Use UTC timestamps for stored dates; localize dates only in the UI.

### 8.1 `MysteryCase`

Recommended fields:

```ts
 type CaseStatus =
   | "QUEUED"
   | "GENERATING_PLAN"
   | "GENERATING_EVIDENCE"
   | "VALIDATING"
   | "READY"
   | "FAILED";

 type Difficulty = "EASY" | "STANDARD" | "HARD";
 type Tone = "COZY" | "NOIR" | "SUSPENSE" | "CAMPUS" | "WORKPLACE" | "CUSTOM";

 interface MysteryCase {
   _id: ObjectId;
   publicId: string;               // cryptographically random opaque ID
   ownerSessionHash: string;       // hash of guest session cookie, never raw cookie
   storyInput: string;             // trimmed/validated user seed
   settings: {
     difficulty: Difficulty;
     tone: Tone;
     customTone?: string;
   };
   status: CaseStatus;
   progress: {
     stage: string;                // safe, user-facing stage code
     percent: number;              // coarse progress only
     message: string;              // safe user-facing text
   };
   publicCase: {
     title: string;
     intro: string;
     incidentSummary: string;
     setting: string;
     incidentAt?: Date;
     suspects: PublicSuspect[];
     evidence: PublicEvidence[];
     publicTimeline: PublicTimelineEvent[];
   };
   solution: {                     // private; excluded from default queries/DTOs
     culpritSuspectId: string;
     motive: string;
     method: string;
     trueTimeline: TimelineEvent[];
     decisiveEvidenceIds: string[];
     redHerrings: Array<{
       evidenceId: string;
       explanation: string;
     }>;
     revealSummary: string;
     privateFacts: string[];
   };
   validation: {
     schemaValid: boolean;
     fairnessValid: boolean;
     repairCount: number;
     validatorVersion: string;
   };
   accusation?: {
     suspectId: string;
     reasoning?: string;
     isCorrect: boolean;
     score: 0 | 100;
     submittedAt: Date;
   };
   createdAt: Date;
   updatedAt: Date;
   expiresAt: Date;                // createdAt + 30 days
 }
```

Implementation note: The exact Mongoose representation may use embedded sub-schemas or separate collections, but solution data must be excluded from normal queries where practical and must never be serialized by returning a raw Mongoose document.

### 8.2 `PublicSuspect`

```ts
interface PublicSuspect {
  id: string;
  name: string;                    // invented fictional name
  role: string;
  profile: string;
  context: string;
  publicAlibi?: string;
  portraitAssetId?: string;         // optional; do not require portraits in v1
}
```

Do not generate suspect portraits by default unless image cost, character consistency, and asset volume are deliberately added to the scope. The required image evidence is an evidence artifact, not necessarily a headshot.

### 8.3 `PublicEvidence`

Use a discriminated union by `type`. Keep public display fields separate from hidden clue annotations.

```ts
type EvidenceType = "CHAT" | "IMAGE" | "CCTV" | "DOCUMENT";
type EvidenceStatus = "PENDING" | "READY" | "FALLBACK" | "FAILED";

interface EvidenceBase {
  id: string;
  type: EvidenceType;
  status: EvidenceStatus;
  title: string;
  sourceLabel: string;
  summary: string;                 // non-spoiler summary
  inWorldAt?: Date;
  mediaAssetId?: string;
  mimeType?: string;
  durationSeconds?: number;
  fictionalLabel: "AI-GENERATED FICTIONAL EVIDENCE";
}

interface ChatEvidence extends EvidenceBase {
  type: "CHAT";
  payload: {
    conversationTitle: string;
    participants: string[];         // suspect IDs or fictional role labels
    messages: Array<{
      id: string;
      senderId: string;
      sentAt: Date;
      text: string;
    }>;
  };
}

interface ImageEvidence extends EvidenceBase {
  type: "IMAGE";
  payload: {
    caption: string;
    altText: string;
    reconstructionNote?: string;
  };
}

interface CctvEvidence extends EvidenceBase {
  type: "CCTV";
  payload: {
    cameraLabel: string;
    recordingStart: Date;
    recordingEnd: Date;
    incidentLog?: string;
    transcript?: string;
    reconstructionNote?: string;
  };
}

interface DocumentEvidence extends EvidenceBase {
  type: "DOCUMENT";
  payload: {
    documentKind: string;
    body: string;
  };
}
```

`FALLBACK` means the item remains available in a different, clearly labelled format. It must not masquerade as a generated video if no video exists.

### 8.4 Private clue annotations

Private annotation fields are stored server-side and never returned in the pre-accusation DTO:

```ts
interface PrivateClueAnnotation {
  evidenceId: string;
  factIds: string[];
  cluePurpose: "DECISIVE" | "SUPPORTING" | "RED_HERRING" | "CONTEXT";
  privateExplanation: string;
  contradictsFactIds?: string[];
}
```

These annotations may be embedded in the private solution or stored in a private evidence subdocument. They must not be included in `PublicEvidence`.

### 8.5 `GenerationJob`

```ts
interface GenerationJob {
  _id: ObjectId;
  jobId: string;
  casePublicId: string;
  ownerSessionHash: string;
  status: "QUEUED" | "ACTIVE" | "COMPLETED" | "FAILED";
  stage: string;
  attemptCount: number;
  providerOperationIds?: string[];  // server-only; never returned raw to client
  safeErrorCode?: string;
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.6 `MediaAsset`

```ts
interface MediaAsset {
  _id: ObjectId;
  assetId: string;
  casePublicId: string;
  ownerSessionHash: string;
  kind: "IMAGE" | "VIDEO" | "RECONSTRUCTION";
  storageKey: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  generationProvider: "MOCK" | "GEMINI";
  modelId?: string;
  createdAt: Date;
  expiresAt: Date;
}
```

### 8.7 Data access and privacy invariants

- All case queries must be scoped by both public case ID and `ownerSessionHash`.
- Public IDs must be unguessable, but unguessability is not authorization; always check ownership.
- Never return raw documents from controllers.
- Use explicit response mappers: `toCaseListDto`, `toCaseDetailDto`, and `toAccusationResultDto`.
- The normal `GET /api/cases/:caseId` response must omit `solution`, private clue annotations, hidden facts, prompts, raw provider operation IDs, and private provider metadata.
- After accusation, return the result only through the authorized case detail DTO or the immediate accusation response. No answer endpoint should reveal the answer before the attempt.
- Atomically lock an accusation once stored.

## 9. AI mystery generation contract

### 9.1 Canonical generation order

Do not ask one unconstrained prompt to create the final case, all evidence, and the answer in an unstructured response. Use a multi-step, schema-validated workflow:

**Stage A — Interpret scenario**

- Treat the user's text as untrusted scenario data, not executable instructions.
- Extract setting, incident, tone, constraints, and themes.
- Fictionalize real-person references or reject unsafe/deceptive requests as specified in FR-012.

**Stage B — Create case truth (private)**

Generate structured JSON with:

- Case title, setting, incident, and short player-facing intro.
- 4–6 unique fictional suspects.
- Exactly one culprit ID, motive, method, and hidden facts.
- A chronological true timeline.
- 6–8 planned evidence items, each tied to one or more explicit facts.
- At least two independent decisive clues.
- At least one explainable red herring.
- The intended reveal and explanation for each clue.

**Stage C — Validate case truth**

Use Zod/domain validation and deterministic checks. Verify suspect counts, unique IDs, valid references, clue count, timestamp order, and minimum decisive clue coverage. Run a model-assisted consistency review when useful, but code validation remains authoritative. Allow at most one repair pass.

**Stage D — Create evidence content**

- Generate each chat transcript and document from explicit case facts.
- Generate image/video prompts from the plan, not independently invented story facts.
- Keep dates, people, locations, clothing/objects, and event descriptions consistent across modalities.
- Do not ask the image model to render crucial readable text; create precise text as HTML/UI overlays from structured data.
- Ensure the image/video prompts describe fictional, staged, non-real-person scenes.

**Stage E — Validate evidence**

- Verify every evidence item references valid IDs and planned facts.
- Verify message timestamps and camera intervals fit the case timeline.
- Where a generated visual is meant to show a decisive fact, inspect the asset with a compatible model or a conservative verification step. If the fact is absent or contradictory, retry once, then replace that item's clue function with an explicit textual log or remove it and regenerate/repair the evidence set within the retry budget.
- Re-run the case fairness validator after any repair.

**Stage F — Publish playable case**

Only set status to `READY` if the player has at least 6 usable evidence items, all minimum evidence categories, at least 2 clear independent clues for the solution, a valid suspect set, and no unresolved critical contradictions. All evidence not generated as video must be labelled according to its actual format.

### 9.2 Required private `CaseTruth` shape

The model output may contain additional useful fields, but must map to a schema with equivalent coverage to this TypeScript shape:

```ts
interface CaseTruth {
  title: string;
  setting: string;
  incident: {
    description: string;
    occurredAt: string;             // ISO datetime, interpreted consistently
    stakes: string;
  };
  playerIntro: string;
  suspects: Array<{
    id: string;
    name: string;
    role: string;
    profile: string;
    context: string;
    publicAlibi?: string;
    privateFacts: string[];
  }>;
  solution: {
    culpritSuspectId: string;
    motive: string;
    method: string;
    trueTimeline: Array<{
      at: string;
      event: string;
      involvedSuspectIds: string[];
      factIds: string[];
    }>;
    privateFacts: string[];
    revealSummary: string;
  };
  facts: Array<{
    id: string;
    statement: string;
    truthValue: "TRUE" | "FALSE" | "UNCONFIRMED";
    relatedSuspectIds: string[];
  }>;
  evidencePlan: Array<{
    id: string;
    type: "CHAT" | "IMAGE" | "CCTV" | "DOCUMENT";
    title: string;
    sourceLabel: string;
    timestampOrRange?: string;
    factIds: string[];
    cluePurpose: "DECISIVE" | "SUPPORTING" | "RED_HERRING" | "CONTEXT";
    privateExplanation: string;
    generationBrief: string;
  }>;
  decisiveEvidenceIds: string[];
  redHerringExplanations: Array<{
    evidenceId: string;
    explanation: string;
  }>;
}
```

All timestamps must use a single, case-consistent timezone strategy. Prefer ISO timestamps with explicit offsets or UTC plus a displayed fictional local timezone. Do not mix ambiguous local times without a timezone.

### 9.3 Evidence generation requirements

**Chat logs**

- Generate structured messages (sender, timestamp, body) and render them with React.
- Generate conversational language appropriate to each character.
- Any contradiction that matters to solving the case must be explicit enough to reason about.
- Use invented contact names and generic mock-chat visual styling. Do not use actual personal chat data.

**Images**

- Generate the image from a specific prompt that references the evidence-plan item and relevant visual facts.
- Avoid tiny embedded lettering, complex documents, fake identification cards, real phone numbers, or logos that imply authenticity.
- Overlay the evidence title, timestamp, source, and fictional label in the application UI.
- Store descriptive alt text and a caption.

**CCTV/video**

- Request a short, purposeful clip suited to investigation, not an entire movie scene. Keep the duration and resolution within the configured provider's current limits and cost envelope.
- Build prompts around subject, action, setting, camera position, composition, lighting, and the specific non-ambiguous event that should be visible.
- Do not make the only decisive clue depend on an exact face, tiny timestamp, precise readable sign, or difficult object continuity in generated video.
- Download finished media into app storage as soon as the provider makes it available.
- Add a visible in-app overlay or caption: “AI-generated fictional CCTV reconstruction — not real footage.”
- If the actual clip cannot be produced, present a CCTV event log and any available reconstructed stills as fallback, clearly naming the fallback.

**Documents and incident logs**

- Render generated text as an application-native document card, not a forged official PDF or authentic-looking government/company record.
- Use visible “FICTIONAL GAME ARTIFACT” labels.

### 9.4 Gemini response and error handling

- Validate input and output with Zod.
- Use the selected model's supported structured-output/JSON-schema capability according to current official documentation.
- If the response cannot be parsed or fails schema validation, retry once with a targeted repair prompt that contains the validation errors but does not expose secrets.
- Normalize provider errors into safe codes such as `AI_RATE_LIMIT`, `AI_TIMEOUT`, `AI_UNAVAILABLE`, `AI_INVALID_OUTPUT`, and `MEDIA_GENERATION_FAILED`.
- Respect `Retry-After` and provider retry instructions when available, but cap attempts and total job duration.
- Never expose raw provider errors, prompts, internal reasoning, or hidden solution fields to the browser.
- Save generation metadata such as provider/model ID and latency for diagnostics, but avoid logging raw story content or hidden solution text by default.

## 10. API contract

Base path: `/api`. All JSON endpoints use the common response envelope.

### 10.1 Response envelope

Success:

```json
{
  "data": {},
  "requestId": "req_opaque_id"
}
```

Failure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "fields": { "storyInput": "Enter at least 50 characters." }
  },
  "requestId": "req_opaque_id"
}
```

Do not return stack traces, raw provider output, API credentials, solution details, or session tokens in API responses.

### 10.2 Endpoints

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| `GET` | `/api/health` | Health check; includes service/database readiness but no secrets | `200` |
| `GET` | `/api/session` | Ensure guest cookie exists; return safe session-ready status | `200` |
| `POST` | `/api/cases` | Validate prompt and enqueue generation | `202` |
| `GET` | `/api/cases` | List cases for the current guest, newest first | `200` |
| `GET` | `/api/cases/:caseId` | Get authorized case detail, progress, public suspects/evidence, and result only if accusation exists | `200` |
| `POST` | `/api/cases/:caseId/accusation` | Submit final accusation and receive verdict/reveal | `200` |
| `DELETE` | `/api/cases/:caseId` | Delete the case and associated assets/jobs | `204` |
| `GET` | `/api/cases/:caseId/media/:assetId` | Authorize and stream/redirect to short-lived media access | `200` or `302` |

Do not add a pre-accusation answer/solution endpoint. Keep route names and DTOs typed and consistent. If a separate job endpoint is added, it must reveal only safe status fields and must enforce the same guest ownership check.

### 10.3 `POST /api/cases` request

```json
{
  "storyInput": "During a storm, a rare painting disappears from a small hotel gallery.",
  "difficulty": "STANDARD",
  "tone": "NOIR",
  "customTone": null
}
```

Validation rules:

- `storyInput`: trim whitespace; required; 50–1,200 characters.
- `difficulty`: `EASY`, `STANDARD`, or `HARD`.
- `tone`: `COZY`, `NOIR`, `SUSPENSE`, `CAMPUS`, `WORKPLACE`, or `CUSTOM`.
- `customTone`: only valid when tone is `CUSTOM`; max 40 characters; optional but normalized if omitted.
- Reject unknown fields if practical to reduce accidental contract drift.

Response:

```json
{
  "data": {
    "caseId": "case_random_public_id",
    "status": "QUEUED",
    "progress": {
      "stage": "QUEUED",
      "percent": 0,
      "message": "Your case is in the queue."
    }
  },
  "requestId": "req_opaque_id"
}
```

### 10.4 `GET /api/cases/:caseId` response

The response contains public case fields and safe generation state only. It may include `result` only if the case already has a stored accusation.

Before accusation, it must never contain `solution`, `culpritSuspectId`, private facts, private clue annotations, generation prompts, raw provider operation IDs, or private validation notes.

### 10.5 `POST /api/cases/:caseId/accusation` request

```json
{
  "suspectId": "suspect_opaque_id",
  "reasoning": "The time on the access log conflicts with the alibi."
}
```

- `suspectId` must refer to a suspect in the case.
- `reasoning` is optional; 0–600 characters after trimming.
- The request is accepted only if the case is `READY` and no final accusation exists.
- The server performs deterministic scoring and stores the attempt atomically.

Successful result includes the verdict, score, culprit, explanation, timeline, decisive evidence references, and red-herring explanations because the player has now committed the final accusation.

### 10.6 Standard HTTP status and error codes

- `400 VALIDATION_ERROR` — invalid request/body.
- `401 SESSION_REQUIRED` — guest session cookie unavailable or invalid.
- `404 CASE_NOT_FOUND` — missing case or case not owned by the current session; do not disclose which condition occurred.
- `409 CASE_NOT_READY` — accusation attempted before ready.
- `409 ACCUSATION_ALREADY_SUBMITTED` — final accusation already exists.
- `413 INPUT_TOO_LARGE` — request exceeds safe size.
- `429 RATE_LIMITED` — creation or API limit reached.
- `502 AI_INVALID_OUTPUT` — AI output repeatedly fails schema/fairness validation.
- `503 AI_UNAVAILABLE` — provider is unavailable or not configured for the requested feature.
- `500 INTERNAL_ERROR` — unexpected error with a request ID, never a raw stack trace.

## 11. Security and privacy

- Keep `GEMINI_API_KEY`, MongoDB credentials, Redis credentials, and object-storage credentials on the server only.
- Use a cryptographically secure random guest session value in an `HttpOnly`, `SameSite=Lax` cookie; set `Secure` in production. Store only a one-way hash of the cookie value in case/job records.
- Use a single configured frontend origin in production and a small explicit allowlist in development. Do not use wildcard CORS with credentials.
- Use Helmet/security headers, request-size limits, request validation, and rate limits.
- Validate every case and asset ID; always enforce guest ownership on read, write, and media routes.
- Escape/render user/model text as text. Do not inject model output into HTML using unsafe `dangerouslySetInnerHTML`.
- Store media with opaque keys and authorized delivery. Do not expose permanent public object-storage URLs if access control is required.
- Avoid logging the full raw cookie, API key, full story input, private solution, private clue annotations, or complete AI prompt. Log request ID, case ID, stage, latency, safe error code, and token/cost metadata when available.
- Use a TTL/cleanup worker for expired cases and media, but also clean media during explicit case deletion.
- Treat all LLM output and user input as untrusted, even when schema-valid.
- The UI and generated media must disclose their fictional/AI-generated status. Do not generate artifacts intended to deceive third parties into believing that a real person did something.

## 12. Environment configuration

Maintain `.env.example` with these variables (values shown are placeholders or development defaults):

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
COOKIE_NAME=amr_guest
COOKIE_MAX_AGE_DAYS=30
SESSION_HASH_SECRET=replace_with_a_long_random_secret
AI_PROVIDER=mock
GEMINI_API_KEY=
GEMINI_TEXT_MODEL=gemini-3.8-flash
GEMINI_IMAGE_MODEL=gemini-nano-banana-2.1
GEMINI_VIDEO_MODEL=gemini-omni-1.1-flash
ENABLE_IMAGE_GENERATION=true
ENABLE_VIDEO_GENERATION=true
REDIS_URL=redis://127.0.0.1:6379
MEDIA_STORAGE=local
MEDIA_LOCAL_DIR=./storage/media
MEDIA_PUBLIC_BASE_URL=
MAX_ACTIVE_JOBS_PER_SESSION=2
CASE_RETENTION_DAYS=30
```

Configuration requirements:

- Validate environment variables on server startup with Zod.
- In `AI_PROVIDER=mock`, do not require `GEMINI_API_KEY` and use deterministic fixtures.
- In `AI_PROVIDER=gemini`, fail fast with a clear server-side startup error if required configuration is missing.
- If video generation is disabled or not configured, enable the explicit CCTV fallback flow rather than silently failing the whole case.
- Do not commit `.env` or real secrets. Include `.env*` in `.gitignore` while allowing `.env.example`.

## 13. Testing and acceptance plan

### 13.1 Unit tests

- Scenario prompt normalization and 50–1,200 character bounds.
- Difficulty-to-suspect/evidence counts.
- Zod schemas for case plan, evidence payloads, API requests, and DTOs.
- Deterministic fairness checks: unique IDs, culprit reference, evidence references, two decisive clues, valid time ranges, and no missing required evidence type.
- Scoring returns 100 only when selected suspect ID equals the stored culprit ID.
- DTO mapper never returns solution/private annotations before accusation.
- Guest session hashing and ownership helper behavior.
- Media cleanup maps each deleted case to its owned media assets.

### 13.2 API integration tests

- Create case returns `202` quickly and creates exactly one job.
- `GET` list/detail returns only cases owned by the current guest cookie.
- Unknown or another guest's case returns the same safe not-found behavior.
- Case generation status survives simulated refresh/re-fetch.
- A case cannot be accused before `READY`.
- A non-member suspect ID is rejected.
- Exactly one final accusation is stored under concurrent/duplicate submissions.
- The answer is not present in pre-accusation payloads, including nested keys and error responses.
- After accusation, result fields are present and match the stored solution.
- Delete case removes the case and media references; a background cleanup test removes expired data.
- Rate limits and invalid payloads return the documented error envelope.

### 13.3 AI provider tests

- Mock provider produces deterministic, schema-valid, fair cases.
- Gemini provider is tested through mocked SDK responses for schema success, invalid JSON, timeout, rate limit, and unavailable media generation.
- A media failure produces a clearly labelled fallback and does not pretend that a video exists.
- A visual contradiction triggers one retry and then a fallback or safe job failure.
- Provider operation IDs, secrets, prompts, and hidden solutions never appear in API DTOs.

### 13.4 Frontend tests

- Creation form validation and disabled/working states.
- Generation progress polling stops when complete or failed.
- Suspect and evidence filters work on desktop/mobile layouts.
- Evidence modal/drawer is keyboard accessible and preserves context.
- Confirmation dialog appears before final accusation.
- Result page clearly distinguishes correct and incorrect answers and links back to evidence.
- Empty/error states are helpful and include navigation actions.

### 13.5 Manual end-to-end acceptance checklist

A version 1 build is acceptable only when all of these are true:

- [ ] A new guest can open `/`, create a mystery, and reach its investigation page.
- [ ] The app works end-to-end using the mock provider without a Gemini key.
- [ ] The generated case has the correct suspect count for selected difficulty.
- [ ] The playable case has 6–8 evidence items, including chat, image, and CCTV/video or clearly labelled fallback evidence.
- [ ] Every evidence item carries an AI-generated fictional label.
- [ ] Timeline, suspect statements, chat messages, and hidden solution are internally consistent.
- [ ] No answer, culprit ID, private facts, or private clue annotations are sent before accusation.
- [ ] User can inspect all evidence, select a suspect, optionally add reasoning, and confirm once.
- [ ] The server calculates the outcome deterministically and locks the attempt.
- [ ] The result reveals the culprit, motive, timeline, decisive clues, and red-herring explanations.
- [ ] Recent cases survive page refresh and are isolated by guest session.
- [ ] Case deletion removes its data and media.
- [ ] Responsive, loading, failure, empty, and media-fallback states work.
- [ ] Typecheck, lint, unit tests, integration tests, and production builds pass.

## 14. Implementation milestones

Build the application in this order. Each milestone must leave the repository runnable.

### Milestone 1 — Repository foundation

- Create npm workspaces and `client`, `server`, and optional `shared` packages.
- Add TypeScript, Vite, React, Tailwind CSS, Express, Mongoose, Zod, and test tooling.
- Add `.env.example`, `.gitignore`, server startup validation, health route, API error envelope, and basic app shell.
- Confirm frontend and backend run locally and build successfully.

**Exit gate:** `npm run dev`, typecheck, lint, and build are documented and working.

### Milestone 2 — Data contracts and mock provider

- Implement Mongoose models, public DTOs, generation job status, guest-session middleware, and owner checks.
- Implement a deterministic mock case provider with a known correct answer and internally consistent clues.
- Implement case creation, case list, case detail, and deletion APIs.

**Exit gate:** API integration tests prove case isolation and no pre-accusation answer leak.

### Milestone 3 — Complete game loop with mock data

- Build landing page, create form, progress experience, case list, suspect board, evidence board, evidence detail views, accusation confirmation, and result reveal.
- Implement deterministic scoring and one-attempt locking.
- Add responsive layout, toasts, loading/empty/error states, and fictional-content labels.

**Exit gate:** The full game is playable with the mock provider without external credentials.

### Milestone 4 — Gemini text/case generation

- Implement Gemini adapter with configurable model IDs and the current official SDK.
- Implement canonical truth generation, structured validation, repair-once behavior, evidence generation, and final fairness validator.
- Add mocked SDK tests for provider failures.

**Exit gate:** Valid cases become playable; invalid cases fail safely without exposing hidden fields.

### Milestone 5 — Image/video generation and storage

- Implement image/video adapter methods and durable media storage.
- Add one generated still image and one generated CCTV/video asset per case when enabled.
- Add immediate media persistence, asset consistency review, fallback evidence, media authorization, and cleanup.

**Exit gate:** Media success and failure paths both remain coherent and honestly labelled.

### Milestone 6 — Hardening and polish

- Complete accessibility and responsive passes.
- Add security headers, rate limits, retention cleanup, logging, tests, and setup documentation.
- Run production build and full acceptance checklist.

**Exit gate:** All required tests and acceptance criteria pass; `.env.example` and README match the actual implementation.

## 15. Definition of done

The product is done for v1 when:

1. All P0 requirements in this spec are implemented.
2. The mock provider supports a complete no-key game loop.
3. The Gemini provider can generate validated mysteries with the configured text model.
4. Image and video generation are integrated behind configurable adapters, with explicit, tested fallbacks.
5. No hidden solution data leaks before the final accusation.
6. Guest ownership, one-attempt scoring, deletion, expiry, rate limiting, and media access controls are tested.
7. The UI is responsive, accessible, polished, and clearly labels all fictional AI-generated content.
8. Lint, type checking, unit tests, integration tests, and production builds pass.
9. README contains accurate setup, environment, mock-provider, Gemini-provider, media-storage, and test instructions.
10. This specification is updated if any accepted product behavior changes.

## 16. Official Gemini references

Model names and API details change. Verify the live documentation when implementing the provider adapters; do not assume these URLs or model IDs are immutable.

- Google GenAI SDK libraries and recommended packages: https://ai.google.dev/gemini-api/docs/libraries
- Gemini API getting started: https://ai.google.dev/gemini-api/docs/get-started
- Current model catalog: https://ai.google.dev/gemini-api/docs/models
- Image generation: https://ai.google.dev/gemini-api/docs/image-generation
- Video generation: https://ai.google.dev/gemini-api/docs/video
- Structured outputs: https://ai.google.dev/gemini-api/docs/structured-output

---

**End of specification.**
