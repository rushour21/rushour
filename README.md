# Rushour

A personal execution system. It does not help you plan more — it works out what
actually fits in your day, holds you to it, then learns how much you can really do.

The full specification is in [`docs/spec.html`](docs/spec.html).

## Running it

```bash
docker compose up -d          # MongoDB on :27017
cp .env.example .env.local    # then set AUTH_SECRET
npm run dev
```

`AUTH_SECRET` can be generated with `openssl rand -base64 32`.

`OPENAI_API_KEY` is optional. Every AI call site has a working fallback, so the
app runs without it — you type the things it would have drafted.

```bash
npm test          # the engine
npm run build
```

## How it is put together

The one rule that shapes the codebase: **`src/lib/engine` imports nothing.** No
Mongo, no OpenAI, no React, no Node built-ins. Every number the product shows —
capacity, the estimation multiplier, readiness, drift, ranking, next week's load
— is computed there, by a pure function, and is therefore reproducible,
explainable and free.

That buys two things. The engine is the only part with real test coverage, and
the same code runs in the browser, so the capacity verdict updates as you type
without a round trip. The server runs the identical function as the authority.

```
src/lib/engine/      pure: capacity, calibration, readiness, drift, ranking, adaptation
src/lib/ai/          five call sites, each with a non-AI fallback
src/lib/actions/     server actions: validate -> engine -> persist
src/lib/db/models/   User, Node, Session, Review
src/app/today/       clock in -> plan -> work -> clock out -> closed
```

### The Day Session

Clock in and clock out are the boundary the rest hangs off. The session is the
unit of planning, of measurement and of review, which is what makes `localDate`
rather than a UTC range the answer to "did I do it today", and what produces
actual durations without asking anyone to keep a timesheet.

A session is sealed on clock-out. The plan, the actuals and the reasons become
immutable — the measured gap between planned and actual is the entire product,
and a plan that can be edited afterwards erases its own evidence.

### Where AI is, and is not

Five call sites: goal-tree drafting, task breakdown, if–then intentions, the
weekly narrative, and feed relevance. All of them are language in or language
out. None is on the critical path of a write.

The weekly narrative is given only the computed figures and is rejected if it
states a number that was not in them (`groundedInNumbers`). One invented
statistic would cost every real one its authority.

No score, ranking or percentage anywhere in the product comes from a model.
