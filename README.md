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