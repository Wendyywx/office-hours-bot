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