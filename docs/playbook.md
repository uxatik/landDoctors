# Project playbook: how LandDoctor was built, reusable for the next idea

Written 10 Oct 2026 from the LandDoctor build (Next.js site for Bangladesh, Bangla first). Everything here is about **how** to build, not about land. Copy this file into a new project as `docs/playbook.md` and point to it from `CLAUDE.md`.

---

## 0. How to use this file

1. Create the new repo, copy this file to `docs/playbook.md`.
2. Add to the new project's `CLAUDE.md`:
   ```md
   Follow docs/playbook.md for stack, conventions and the build loop.
   Project-specific decisions go in docs/decisions.md; every loop is logged in docs/loop-log.md.
   ```
3. Start the first session with the prompt in section 15.

---

## 1. The build loop ("loop engineering")

Every task runs the same loop. No task is "done" until the loop closes.

| Step | What it means in practice |
|---|---|
| **PLAN** | Write the task in `docs/plan.md`: goal, files, tests to write, what "done" looks like. Check scope against the brief. |
| **TEST** | Write the tests first (unit, database, browser). They fail. |
| **BUILD** | Write the smallest code that makes them pass. Reuse existing components and tokens. |
| **VERIFY** | Run everything: `npm run check` (types, lint, unit, database) and `npm run e2e` (phone 360×740 and desktop 1280×800, accessibility scan). Take screenshots and *look* at them. |
| **REVIEW** | Score the work on the rubric below. For high-stakes work (payments, security, legal text), a separate reviewer that did not write the code does the review. |
| **FIX** | Fix anything under 4 on the rubric, then VERIFY again. |
| **LOG** | One entry in `docs/loop-log.md`: what changed, what was found and fixed, test counts, what is still open. Decisions that future work must respect go to `docs/decisions.md` (D1, D2, …). |

### The rubric (score 1–5, every item must be ≥ 4)

Scope · Correctness · Security · Usability · Trust · Design-system fidelity · Code quality · Performance

### Rules that made the loop work

- **One task at a time, tested before the next.** When the founder asked for 13 things at once, they were built in 4 passes, each tested before moving on.
- **Evidence before claims.** "Done" means the test output or screenshot was seen, not assumed. Live-site claims are checked on the live site.
- **Say what was not checked.** Every log entry and every report to the founder lists what could not be verified.
- **Stop points.** Some decisions always go to the founder: deploys, domains, live keys, money, anything that cannot be undone, and anything that changes what customers are told. Everything else proceeds without asking.
- **Unrequested changes are reported.** If a fix touched something the founder did not ask about (e.g. a false claim on the home page), say so in one line.
- **Log format** (copy):
  ```md
  ## Iteration — <short name> (<date>)
  Founder asked: <one line>. Built: <what>. Found and fixed: <bugs caught by tests/screenshots>.
  Checks: <n> unit, <n> database, <n> browser tests. Not done / not checked: <list>.
  ```
- **Decision format** (copy):
  ```md
  ## D<n> — <decision in one line> (<date>)
  Why, what it affects, where the value lives in code, how to change it later.
  ```

### Parallel research agents

For anything factual (laws, fees, procedures, prices, places), several research agents run in parallel, each with one topic, and return **fact sheets**, not prose:

- one plain sentence per fact, the local-language term, source URL, source date
- confidence: **HIGH** (official source, or two reliable sources agree), **MEDIUM** (one reliable source), **LOW** (old, unclear, disagreeing)
- a "Could not verify" list per topic

Writing then uses HIGH and MEDIUM facts only. Disputed figures are **left out of the text** and put on the reviewer's list instead.

---

## 2. Before any code: research → brief → plan

1. **Research report**: demand, competitors at home and abroad, legal risks, revenue streams, worst cases, a stop-loss rule (e.g. "fewer than 30 paid orders in 3 months → stop and rethink").
2. **Project brief**: problem, solution, users, what Phase 1 includes and excludes, operations (who does what), budget, metrics, risks, open questions.
3. **Plan**: 10–15 tasks, each with files, tests and "done" criteria; a "Global constraints" list; a "Review focus" list of the 5 riskiest behaviours with the test that covers each; stop points.

Phase 1 is always the smallest thing that proves people will use or pay for it.

---

## 3. Stack (and when to drop parts)

| Layer | Used | Why | Drop it when |
|---|---|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript strict | Server-rendered pages: fast on cheap phones, readable by search engines and AI crawlers | Never for a public site |
| Styling | Tailwind CSS v4, tokens in `@theme inline` | One token file controls colour, spacing, radius | — |
| Languages | next-intl 4: Bangla at `/`, English at `/en`, no browser-language redirect | Bangla-first audience, English for expatriates and search | Single-language site |
| Validation | zod | Same rules on server and client | — |
| Database + auth | Supabase (Postgres, row-level security, staff login with TOTP) | Free tier, real Postgres, RLS | Content-only sites: use files in the repo instead |
| Payments | SSLCommerz sandbox behind a flag; manual bKash meanwhile | Local methods (bKash, Nagad, card) | No money taken |
| Tests | Vitest (unit), SQL tests on local Postgres 16, Playwright + axe (browser + accessibility) | Every risky behaviour has a test | Never drop browser tests |
| Hosting | Vercel (Git push = deploy), domain at Name.com with nameservers pointed to Vercel | Zero server work | — |
| Fonts | Self-hosted Hind Siliguri (Bangla) + a Latin face as WOFF2 subsets, `font-display: swap` | No Google Fonts request; Bangla conjuncts render | — |

`package.json` scripts to copy:
```json
"typecheck": "tsc --noEmit",
"lint": "eslint .",
"test": "vitest run --passWithNoTests",
"test:db": "bash scripts/db-test.sh",
"e2e": "playwright test",
"check": "npm run typecheck && npm run lint && npm run test && npm run test:db"
```

---

## 4. Skills used (Claude Code)

Installed into `.claude/skills/` and pinned in `skills-lock.json`:

| Source | Skills |
|---|---|
| `obra/superpowers` | brainstorming, writing-plans, executing-plans, subagent-driven-development, dispatching-parallel-agents, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, receiving-code-review, finishing-a-development-branch, using-git-worktrees, using-superpowers, writing-skills, diagnosing-superpowers |
| `anthropics/skills` | frontend-design, webapp-testing |
| `vercel-labs/agent-skills` | vercel-react-best-practices, vercel-composition-patterns, web-design-guidelines |
| `supabase/agent-skills` | supabase-postgres-best-practices |
| `trailofbits/skills` | sharp-edges, entry-point-analyzer, differential-review, supply-chain-risk-auditor |
| Own | `designfoli` (design system: tokens, fonts, components) |

Also used from the session's plugins: `seo-ai-visibility` (search and AI audit), `chrome-browser` (only where site permissions allow).

Which skill when: **writing-plans** before a multi-step task, **test-driven-development** for each task, **systematic-debugging** for any failing test, **verification-before-completion** before saying "done", the four Trail of Bits skills for the security pass before launch, **supabase-postgres-best-practices** before any SQL.

---

## 5. Folder layout

```
app/
  [locale]/            public pages (bn at /, en at /en)
    (content)/         narrow reading column: forms, legal, services, guides
  admin/               staff area (noindex, no-store)
  api/                 payment callbacks only
  robots.ts  sitemap.ts  llms.txt/route.ts  icon.svg  apple-icon.png  favicon.ico
components/            shared UI; landing/ for home-page sections
design/tokens.css      the ONLY place brand colours live
lib/
  env.ts env-check.ts  settings, validated; production build fails on missing values
  seo.ts               pageMeta(): title, description, canonical, other language, share image
  content/             plain-data content (legal, services, guides) — no Markdown, no HTML
messages/bn.json en.json  every UI string, same keys in both
supabase/migrations/   numbered SQL
tests/unit db e2e/
scripts/               screenshots, brand images, staff creation, db tests
docs/                  plan, decisions, loop-log, launch-checklist, brief, research
```

---

## 6. Conventions

### Language (Bangla first)
- Every UI string exists in `messages/bn.json` **and** `messages/en.json`. A unit test fails if the key sets differ or a Bangla string has no Bangla letters.
- Only send the client the message namespaces client components use (smaller pages).
- Numbers: English digits for prices and phone numbers on display (`৳8,000`, `01712-345678`); accept Bangla digits (০–৯) in every input and convert.
- Write Bangla as people speak it, short and professional; no translated-sounding sentences. Have a native speaker read it on a phone.
- Content that exists in one language only: no link to the missing language, and the other-language address redirects to that language's list page.

### Design system
- A design system skill provides tokens, fonts and rules; `design/tokens.css` maps project names onto it. Brand overrides live in one block at the top of that file.
- No hard-coded hex in components. No decorative borders; separate sections with background changes and soft shadows.
- No stock photos, fake testimonials or fake logos. Small HTML visuals instead of images.
- Check every page at 360 px wide: no sideways scroll (test compares `scrollWidth` with the viewport width).

### Copy rules
- One short line per idea. State facts plainly. Never promise what the business cannot control.
- Every claim on the site must be true **today** (payment methods, response times, hours). Keep a "claims checked" line in the launch checklist.

### Accessibility and speed
- axe scan in browser tests: no serious or critical issues.
- Tap targets ≥ 48 px. Visible focus. Works without JavaScript where possible (CSS `:has()` for show/hide).
- Fonts as WOFF2 subsets, preload the two main weights, avoid blur filters and large client bundles.
- Result on LandDoctor: PageSpeed mobile 89, desktop 100; SEO, accessibility, best practices 100.

---

## 7. Settings, secrets and switches

- `lib/env.ts` validates every setting with zod. `lib/env-check.ts` makes a **production** build fail if a required value is missing or still a placeholder.
- Public settings are accepted with or without the `NEXT_PUBLIC_` prefix (`SITE_URL` = `NEXT_PUBLIC_SITE_URL`), mapped in `next.config.ts`. Secrets (service-role key, salts) never get a public name.
- `SITE_URL` is reduced to its origin, so a pasted `/en` or trailing slash cannot break links. (This happened on the live site.)
- Feature switches instead of code changes: `PAYMENTS_ENABLED`, `CALLS_ENABLED`, `BKASH_NUMBER`, `BKASH_ACCOUNT_TYPE`, `LEGAL_DRAFT`, per-guide `review`.
- `.env.example` is a blank template only. Real keys live in `.env.local` (never committed) and in Vercel.
- **If a key is ever committed:** rotate it immediately, make the repo private; removing it in a later commit does not remove it from history.

---

## 8. Data and security (when there is a database)

- Anonymous visitors **call database functions, never tables**. Each function validates input, rate-limits by hashed IP, uses an idempotency key (a double tap creates one record), and returns only what the page needs.
- Row-level security on every table; all default privileges revoked.
- Staff must pass two-step verification (TOTP) before any data access; admin pages are `noindex` and `no-store`.
- Money as whole integers, never floats. Prices on an offer are a snapshot. Amounts are always read from the database, never from the browser.
- Payment callbacks are validated with the gateway from the server, and are idempotent.
- No document uploads or ID numbers stored until there is a security review.
- Database tests run on local Postgres 16 with a small Supabase shim, so they run anywhere without Docker.

---

## 9. Testing

| Layer | Tool | What it covers |
|---|---|---|
| Unit | Vitest | validation, phone normalisation, payment parsing, message keys, settings, content rules (e.g. "an unreviewed guide is never public") |
| Database | SQL test files on Postgres 16 | schema rules, functions, RLS, workflow, payments, rate limits |
| Browser | Playwright, phone 360×740 + desktop 1280×800 | every page and flow, both languages, accessibility (axe), no sideways scroll |
| Live | WebFetch / browser after each deploy | the pages, `robots.txt`, `sitemap.xml`, canonical tags, share image on the real domain |

Lessons:
- Use `page.viewportSize().width` for overflow checks; phone emulation can widen `innerWidth`.
- Scope locators (`#services`, `main`) once a page has two links with the same name.
- Tests that need real services (database, gateway) are skipped with a reason, not deleted, and run on the founder's machine.
- After adding a second JSON-LD block, tests reading "the" JSON-LD break: read all blocks.

---

## 10. Search and AI visibility (built into every public site)

- Google states there are **no extra requirements** for AI Overviews / AI Mode beyond being indexed and snippet-eligible. Same work serves both.
- `lib/seo.ts` → `pageMeta()` on every public page: title, description (real, per page), canonical, other-language address (only languages the page exists in), share image.
- `app/robots.ts`: allow public pages (including AI crawlers, a founder decision), disallow admin, API, per-customer pages.
- `app/sitemap.ts`: only finished public pages; drafts and private pages left out.
- Business JSON-LD on the home page, built from the **same strings** the page shows (prices cannot drift).
- `/llms.txt` generated from the same strings and settings.
- Share images (1200×630, one per language) drawn with Playwright from HTML using the real fonts (`scripts/make-brand-images.mjs`); favicon via a small Python step.
- Old domain → new domain redirect in middleware, active only when `SITE_URL` is the new https address.
- Drafts (legal pages, unreviewed guides): visible banner + `noindex` + not in sitemap + not in menus.
- After launch: Search Console + Bing Webmaster (verify, submit sitemap), Google Business Profile, then a monthly "what does a searcher see" snapshot. Never fake reviews, hidden text, or instructions aimed at AI.

---

## 11. Content that states facts

- Guides and articles live as plain data (`lib/content/...`), each with: `updated` date, `sources[]`, `reviewNotes[]` (what the expert must confirm), and `review: { by, role, on } | null`.
- `review: null` ⇒ draft: banner showing the reviewer's checklist, `noindex`, not in sitemap or menus. Publishing = a named expert reviews it and the field is filled in.
- Every article ends at the decision point and leads to the paid service ("which of these applies depends on your papers"). Free content explains; the business sells judgment on the person's own case and work on the ground.

---

## 12. Deploy and operations

1. Private GitHub repo → Vercel project (push = deploy).
2. Settings in Vercel (names without `NEXT_PUBLIC_` are fine). Production build fails loudly if something is missing.
3. Domain: buy at a registrar (no add-ons needed), point **nameservers** to Vercel (`ns1/ns2.vercel-dns.com`), add both `example.com` and `www.example.com` in Vercel, set `SITE_URL`, push.
4. When the build environment cannot push to GitHub: create a git bundle, copy it to the founder's machine, `git pull --ff-only <bundle> main`, founder runs `git push`.
5. After each deploy: open the live pages, `robots.txt`, `sitemap.xml`; run PageSpeed Insights.
6. Keep `docs/launch-checklist.md`: legal, accounts, content and prices, deployment, operations. Tick items only when checked.

### Bangladesh-specific patterns (reusable)
- WhatsApp first: `wa.me/880…?text=…` links with a pre-typed message (include a reference number when there is one); a floating WhatsApp button, hidden where the page already has its own contact block or where it would cover a form.
- Phone calls behind a switch until someone answers them.
- bKash by hand until a gateway is approved: the page shows number, exact amount, reference, and a "send TrxID on WhatsApp" button; staff record the TrxID.
- bKash Personal Retail Account for small businesses without a trade licence; SSLCommerz needs trade licence, TIN, bank account, DBID.

---

## 13. Mistakes made once (avoid them next time)

| Mistake | Fix |
|---|---|
| Real keys committed to `.env.example` | Template only; rotate keys; private repo |
| `SITE_URL` set to old domain with `/en` | Origin-only normalisation; checklist line; check sitemap after deploy |
| Headings grew huge after installing the design system | Explicit size classes on every heading |
| Decorative glows caused 8 px sideways scroll on phones | `overflow-x: clip`; test with viewport width |
| A user request was misread (whole hero turned teal instead of one panel) | Repeat back the exact target element before large visual changes |
| Translated-sounding Bangla | Rewrite as spoken Bangla; native read on a phone |
| Claims that were not true yet ("pay online", call buttons with no one answering) | "Claims checked" pass before launch; switches for unfinished channels |
| Page speed dropped to 75 | WOFF2 subsets, fewer client strings, no blur |
| A Python helper named `copy.py` broke imports | Never name scripts after standard modules |

---

## 14. Adapting this to a new idea: "৬৪ জেলার বিখ্যাত খাবার" checklist

### What to keep and what to drop
| Keep | Drop for Phase 1 |
|---|---|
| Next.js, Tailwind, next-intl (bn/en), design system, tokens | Supabase, staff area, payments, WhatsApp flows |
| The loop, rubric, decisions and loop logs | TOTP, rate limits, RLS (no database yet) |
| Playwright + axe, phone-first checks | Offer and payment pages |
| `pageMeta`, robots, sitemap, llms.txt, share images | — |
| Fact sheets with confidence + review gate | — |

### Suggested shape
- **Data first, as files:** `content/districts.ts` (64 districts: name bn/en, division, slug) and `content/foods.ts` (name bn/en, district, short description, where it is known from, `sources[]`, `confidence`, `review`). "Famous" is often contested: keep sources per item and leave out what cannot be sourced.
- **Pages:** home (map or division list + progress), one page per district (64 × 2 languages), one page per food. These are the pages people search for ("বগুড়ার দই", "নাটোরের কাঁচাগোল্লা").
- **Checklist state:** in the browser (`localStorage`) for Phase 1, no accounts. A shareable progress image ("আমি ২৩/৬৪ জেলার খাবার খেয়েছি") drawn the same way as the share images — this is the growth loop.
- **Images:** own photos, or openly licensed ones with attribution; never copied from blogs or Facebook.
- **Phase 1 test of demand:** post the checklist as an image in Facebook food groups before building; build only if people ask for it.
- **Later, if it works:** accounts to save progress across phones, user-submitted spots (with moderation), partnerships with sweet shops or tour operators.

---

## 15. First prompt for a new project (copy, then edit the brackets)

```text
Read docs/playbook.md and follow it.
Idea: [one paragraph]. Audience: [who], language: Bangla first, English second.
My research so far: [paste or attach].

1. Research: run parallel research agents with fact sheets (source, date, HIGH/MEDIUM/LOW, could-not-verify).
2. Write docs/project-brief.md and docs/plan.md (Phase 1 only, 10–15 tasks, global constraints, review focus, stop points).
3. Stop and wait for my approval of the plan.
4. Then build task by task with the loop: PLAN → TEST → BUILD → VERIFY → REVIEW → FIX → LOG,
   rubric ≥ 4 on all eight, screenshots at 360 px and desktop, log every loop, decisions in docs/decisions.md.
Deploys, domains, keys and anything that cannot be undone are my decision.
```
