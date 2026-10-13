# Office Hours Bot

A small Next.js prototype for course-material Q&A. It uses sample course content, displays a source with each answer, and says when it cannot find a supported answer. It does not use a database, sign-in provider, payment service, or external AI API.

## Try the demo

Live app: https://office-hours-bot.vercel.app

Try asking: `What is the late policy?`

The sample syllabus says assignments may be submitted up to three days late with a 10 percent penalty. This is demonstration content, not an official course policy.

## Run locally

Requires Node.js 20 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```sh
npm test
npm run build
```

## Repository

https://github.com/Wendyywx/office-hours-bot

## HW3 Scope and Non-goals

The HW3 feature target is Story 4, Lecture Practice Set: create 3 to 5 questions from a named lecture and keep answers hidden until requested.

- Real payments are a non-goal. Any payment flow is simulated.
- Real authentication, including university sign-in, is a non-goal. The prototype uses a typed name.
- A database and persistent storage are non-goals. The current conversation state is held in page memory and clears on reload. HW3 server-side in-memory data will reset on every deployment.
- A real external AI service is not used in this prototype.

## Security spec audit

| Requirement | Status and reason |
|---|---|
| SEC-001 — University SSO | **Not at all:** access uses a typed name; there is no university sign-in. |
| SEC-002 — Membership check | **Not at all:** there is no sign-in, roster lookup, or role assignment. |
| SEC-003 — Session limits | **Not at all:** there are no authenticated sessions or secured session cookies. |
| SEC-004 — Session revocation | **Not at all:** there are no accounts, roster, or revocable sessions. |
| SEC-005 — Server-side role checks | **Not at all:** the practice-answer route has no caller identity or role checks. |
| SEC-006 — Students see only their own records | **Partly:** no chat records are stored or fetched by ID, but there is no identity or ownership-check system. |
| SEC-007 — No staff access to individual chats | **Partly:** no staff chat screen or export exists, but there is no role-based access architecture. |
| SEC-008 — Restricted operator access | **Partly:** there is no database to access, but no named-operator list or access audit exists. |
| SEC-009 — Data minimization | **Partly:** the typed display name and chat stay in page memory, but there is no controlled user-record schema. |
| SEC-010 — Deletion on request | **Partly:** “New conversation” clears the visible in-page chat, but there is no permanent database or backup deletion workflow. |
| SEC-011 — End-of-semester deletion | **Not at all:** scheduled deletion and professor notification are not implemented. |
| SEC-012 — AI vendor rules | **Partly:** no questions are sent to an AI vendor, but no approved vendor or vendor contract is configured. |
| SEC-013 — Encryption | **Partly:** the deployed site uses HTTPS; there is no database, file store, or backup encryption configuration in this prototype. |
| SEC-014 — PDF upload checks | **Not at all:** document upload and scanning are not implemented. |
| SEC-015 — Prompt-injection defenses | **Partly:** there is no uploaded content or AI prompt to inject, but no injection defenses or evaluation are implemented. |
| SEC-016 — AI cannot take actions | **Fully for this prototype:** no AI model, tools, or external actions are connected. |
| SEC-017 — Safe answer display | **Fully for this prototype:** answers render as text; the app does not render answer HTML, images, scripts, or clickable external links. |
| SEC-018 — Anonymous weekly summary | **Not at all:** weekly summaries are not implemented. |
| SEC-019 — Anonymous answer reports | **Not at all:** answer reporting is not implemented. |
| SEC-020 — Hidden information stays hidden | **Partly:** common direct requests for system instructions, private graded material, and another student's questions are refused; there are no private items loaded or prompt-injection evaluations. |
| SEC-021 — No cross-student leakage | **Fully for this prototype:** chat stays in the current browser page; no chat search index or AI request exists. |
| SEC-022 — Per-student usage limits | **Partly:** the page enforces a 2,000-character field limit and 40 questions per page session; daily and per-minute server-side limits are absent. |
| SEC-023 — Hard AI budget cap | **Partly:** no AI calls or AI charges occur, but no budget meter or provider-side spending cap is configured. |
| SEC-024 — Staff upload limits | **Not at all:** staff accounts and document uploads are not implemented. |
| SEC-025 — Audit log | **Not at all:** staff actions, access denials, and operator activity are not audit-logged. |
| SEC-026 — No chat content in technical logs | **Fully for this prototype:** chat text is not sent to the server; the practice-answer endpoint receives only a question ID. |
| SEC-027 — Secrets management | **Partly:** no API keys are used, and environment files are ignored by Git; no secrets manager is configured. |
| SEC-028 — Original files protected | **Fully for this prototype:** there are no uploaded or stored PDFs to expose. |
| SEC-029 — Incident notice | **Not at all:** an incident-detection and professor-notification process is not implemented. |