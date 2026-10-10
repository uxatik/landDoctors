# Build playbook

Follow this for every new web project: how to plan, build, test, launch and keep decisions on record.

---

## 1. Phases

1. **Research**: demand, competitors at home and abroad, legal or safety risks, how it could earn money, worst cases, and a stop rule (for example "fewer than 30 paying users in 3 months → stop and rethink").
2. **Brief** (`docs/project-brief.md`): problem, users, what Phase 1 includes and excludes, who runs it, budget, success numbers, risks, open questions.
3. **Plan** (`docs/plan.md`): 10–15 tasks, each with files, tests and "done" criteria; a list of global constraints; the 5 riskiest behaviours with the test that covers each; stop points.
4. **Build**: task by task with the loop in section 2.
5. **Launch**: work through `docs/launch-checklist.md`; tick only what was checked.
6. **Measure**: the numbers from the brief, weekly. Decide what to build next from those, not from guesses.

Phase 1 is the smallest thing that proves people will use it or pay for it. The plan is approved before any code is written.

---

## 2. The build loop

Every task runs this loop. A task is not done until the loop closes.

| Step | What it means |
|---|---|
| **PLAN** | Goal, files, tests to write, what "done" looks like. Check against the brief's scope. |
| **TEST** | Write the tests first. They fail. |
| **BUILD** | The smallest code that makes them pass. Reuse existing components and tokens. |
| **VERIFY** | Run all checks (`npm run check`, `npm run e2e`) on phone 360×740 and desktop 1280×800, with an accessibility scan. Take screenshots and look at them. |
| **REVIEW** | Score on the rubric. For high-stakes work (payments, security, legal text), a separate reviewer that did not write the code does it. |
| **FIX** | Anything under 4 gets fixed, then VERIFY again. |
| **LOG** | One entry in `docs/loop-log.md`. Decisions later work must respect go to `docs/decisions.md`. |

**Rubric** (1–5, every item ≥ 4): Scope · Correctness · Security · Usability · Trust · Design-system fidelity · Code quality · Performance

**Rules**
- One task at a time, tested before the next. Big requests are split into passes.
- Evidence before claims: "done" means the test output or screenshot was seen. Live claims are checked on the live site.
- Every report says what could not be checked.
- The owner decides: deploys, domains, keys, money, anything that cannot be undone, and anything that changes what users are told. Everything else proceeds without asking.
- Changes the owner did not ask for are reported in one line.
- Before a large visual change, name the exact element being changed.

**Log entry**
```md
## Iteration — <short name> (<date>)
Asked: <one line>. Built: <what>. Found and fixed: <what tests or screenshots caught>.
Checks: <n> unit, <n> database, <n> browser tests. Not done / not checked: <list>.
```

**Decision entry**
```md
## D<n> — <decision in one line> (<date>)
Why, what it affects, where the value lives in code, how to change it later.
```

---

## 3. Research with parallel agents

For anything factual (laws, fees, procedures, prices, places, history), run several research agents in parallel, one topic each. Each returns a **fact sheet**, not prose:

- one plain sentence per fact, the local-language term, source URL, source date
- confidence: **HIGH** (official source, or two reliable sources agree) · **MEDIUM** (one reliable source) · **LOW** (old, unclear, or sources disagree)
- a "Could not verify" list

Write only from HIGH and MEDIUM facts. Leave disputed figures out of the text and list them for a reviewer.

---

## 4. Default stack

| Layer | Default | Add or drop |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript strict | Always for a public site: server-rendered, fast on cheap phones, readable by search and AI crawlers |
| Styling | Tailwind CSS v4, tokens in `@theme inline` | — |
| Languages | next-intl: Bangla at `/`, English at `/en`, no browser-language redirect | Drop for a single-language site |
| Validation | zod, same rules on server and client | — |
| Data | Content as typed files in the repo | Add Supabase (Postgres, row-level security, auth) only when users save data or staff manage records |
| Payments | None | Add a gateway behind a switch; manual payment meanwhile |
| Tests | Vitest, Playwright + `@axe-core/playwright` | Add SQL tests on local Postgres when there is a database |
| Hosting | GitHub (private) → Vercel, push = deploy | — |
| Fonts | Self-hosted, WOFF2 subsets, `font-display: swap`; Hind Siliguri for Bangla | — |

`package.json` scripts:
```json
"typecheck": "tsc --noEmit",
"lint": "eslint .",
"test": "vitest run --passWithNoTests",
"e2e": "playwright test",
"check": "npm run typecheck && npm run lint && npm run test"
```
(Add `"test:db"` to `check` when a database exists.)

---

## 5. Skills to install

Install into `.claude/skills/` at the start and pin them in `skills-lock.json`.

| Source | Skills | Use |
|---|---|---|
| `obra/superpowers` | writing-plans, executing-plans, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, receiving-code-review, dispatching-parallel-agents, subagent-driven-development, brainstorming, finishing-a-development-branch, using-git-worktrees, using-superpowers, writing-skills | The loop itself |
| `anthropics/skills` | frontend-design, webapp-testing | UI and browser testing |
| `vercel-labs/agent-skills` | vercel-react-best-practices, vercel-composition-patterns, web-design-guidelines | React/Next.js quality, UI review |
| `supabase/agent-skills` | supabase-postgres-best-practices | Only if there is a database; load before any SQL |
| `trailofbits/skills` | sharp-edges, entry-point-analyzer, differential-review, supply-chain-risk-auditor | Security pass before launch |
| A design-system skill | tokens, fonts, components | Load before any UI work |

Also useful: an SEO and AI-visibility audit skill after launch.

---

## 6. Folder layout

```
app/
  [locale]/            public pages
    (content)/         narrow reading column: forms, articles, legal
  robots.ts  sitemap.ts  llms.txt/route.ts  icon.svg  apple-icon.png  favicon.ico
components/
design/tokens.css      the only place brand colours live
lib/
  env.ts env-check.ts  validated settings; production build fails on missing values
  seo.ts               pageMeta(): title, description, canonical, other language, share image
  content/             typed content as plain data (no raw HTML)
messages/bn.json en.json  every UI string, same keys in both
tests/unit e2e/
scripts/               screenshots, share images, helpers
docs/                  project-brief, plan, decisions, loop-log, launch-checklist
```

---

## 7. Conventions

**Language**
- Every UI string in both `bn.json` and `en.json`. A unit test fails if the key sets differ or a Bangla string has no Bangla letters.
- Send the browser only the message namespaces client components use.
- English digits for prices and phone numbers on display (`৳8,000`, `01712-345678`); accept Bangla digits (০–৯) in every input and convert.
- Write Bangla the way people speak, short and professional; a native speaker reads it on a phone before launch.
- A page that exists in one language only does not link to the other language; that language's address redirects to its list page.

**Design**
- A design-system skill supplies tokens, fonts and rules; `design/tokens.css` maps the project onto it. Brand overrides live in one block in that file. No hard-coded colours in components.
- Give every heading an explicit size; base styles from a design system can make bare headings huge.
- Separate sections with background changes and soft shadows, not decorative borders.
- No stock photos, fake testimonials or fake logos.

**Copy**
- One short line per idea; facts stated plainly; never promise what the business cannot control.
- Every claim must be true on launch day (payment methods, hours, response times). Unfinished channels stay behind a switch.

**Accessibility and speed**
- axe scan in browser tests: no serious or critical issues. Tap targets ≥ 48 px. Visible focus.
- No sideways scroll at 360 px; test compares `scrollWidth` with `page.viewportSize().width`.
- Prefer CSS (`:has()`) over JavaScript for show/hide.
- Fonts as WOFF2 subsets with the two main weights preloaded; no blur filters; small client bundles. Target PageSpeed mobile ≥ 90.

---

## 8. Settings, secrets and switches

- Validate every setting with zod in `lib/env.ts`; `lib/env-check.ts` fails a production build when a required value is missing or still a placeholder.
- Accept public settings with or without the `NEXT_PUBLIC_` prefix and map them in `next.config.ts`. Secrets never get a public name.
- Reduce `SITE_URL` to its origin so a pasted path or trailing slash cannot break links.
- Use switches instead of code edits for anything that changes with the business: `PAYMENTS_ENABLED`, `CALLS_ENABLED`, draft flags, contact numbers.
- `.env.example` is a blank template. Real keys live only in `.env.local` (never committed) and in Vercel.
- If a key is ever committed: rotate it at once and make the repo private. A later commit does not remove it from history.

---

## 9. Data and security (only when there is a database)

- Anonymous visitors call narrow database functions, never tables. Each function validates input, rate-limits by hashed IP, accepts an idempotency key (a double tap creates one record), and returns only what the page needs.
- Row-level security on every table; default privileges revoked.
- Staff need two-step verification (TOTP) before any data access; admin pages are `noindex` and `no-store`.
- Money as whole integers. Amounts always read from the database, never from the browser. Payment callbacks validated with the gateway from the server and idempotent.
- No document uploads or ID numbers stored before a security review.
- Database tests run on local Postgres with a small shim, so they run anywhere without Docker.

---

## 10. Testing

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | validation, formatting, message keys, settings, content rules |
| Database | SQL test files | schema rules, functions, row-level security, workflows |
| Browser | Playwright, phone + desktop | every page and flow in both languages, accessibility, no sideways scroll |
| Live | after each deploy | real pages, `robots.txt`, `sitemap.xml`, canonical tags, share image, PageSpeed |

- Scope locators (`main`, a section id) once two links share a name.
- When a page has more than one JSON-LD block, read them all.
- Tests that need real services are skipped with a reason, not deleted.

---

## 11. Search and AI visibility

- Google states there are no extra requirements for AI Overviews / AI Mode beyond being indexed and snippet-eligible; the same work serves search and AI.
- `pageMeta()` on every public page: real title and description, canonical, other-language address (only where the page exists), share image.
- `robots.ts`: allow public pages (allowing AI crawlers is an owner decision); disallow admin, API and per-user pages.
- `sitemap.ts`: finished public pages only.
- JSON-LD and `/llms.txt` built from the same strings the pages show, so facts cannot drift.
- Share images (1200×630, one per language) drawn with Playwright from HTML with the real fonts.
- Drafts: visible banner + `noindex` + left out of sitemap and menus.
- After launch: Search Console and Bing Webmaster (verify, submit sitemap), Google Business Profile if there is a business, a monthly "what does a searcher see" check. Never fake reviews, hidden text or instructions aimed at AI.

---

## 12. Content that states facts

- Keep articles as typed data with `updated`, `sources[]`, `reviewNotes[]` and `review: { by, role, on } | null`.
- `review: null` means draft (banner listing what the reviewer must confirm, `noindex`, not in sitemap or menus). Publishing means a named expert has checked it.
- If the content supports a paid service, each piece explains the problem and options and stops where the reader's own situation needs a person.

---

## 13. Deploy and domain

1. Private GitHub repo → Vercel project.
2. Settings in Vercel; the production build fails loudly if something is missing.
3. Domain: buy at a registrar without add-ons; point the nameservers to Vercel; add both `example.com` and `www.example.com` in Vercel; set `SITE_URL`; push.
4. After every deploy: open the live pages, `robots.txt`, `sitemap.xml`; run PageSpeed Insights.
5. If pushing is not possible from the build environment: create a git bundle, pull it on the owner's machine with `git pull --ff-only`, owner pushes.

---

## 14. Bangladesh modules (add when needed)

- **WhatsApp contact**: `wa.me/880…?text=…` links with a pre-typed message (include a reference number when there is one); a floating button, hidden where the page has its own contact block or where it would cover a form.
- **Phone calls**: behind a switch until someone answers them.
- **Manual bKash payment** until a gateway is approved: show number, exact amount, reference, and a "send TrxID on WhatsApp" button; staff record the TrxID.
- **Payment gateway** (e.g. SSLCommerz): needs trade licence, TIN, business bank account and DBID. A bKash Personal Retail Account works without a trade licence for small amounts.

---

## 15. Pitfalls to check every time

- Keys in committed files.
- `SITE_URL` still pointing at the old address after a domain change.
- `www` not added to the hosting project (certificate error).
- Decorative elements causing sideways scroll on phones.
- Bangla that reads like a translation.
- Claims on the site that are not true yet.
- Page speed dropping after adding fonts or effects.
- Script files named after standard modules (`copy.py`, `json.py`).

---

## 16. Launch checklist (starting template)

```md
## Legal and business
- [ ] Legal pages reviewed by a lawyer; draft flag off
- [ ] Accounts and licences needed for payments
## Content
- [ ] Every claim on the site checked as true today
- [ ] Bangla read by a native speaker on a phone
- [ ] Draft content reviewed or kept out of search
## Technical
- [ ] Private repo; no keys in history (or keys rotated)
- [ ] All settings in Vercel; SITE_URL = real domain; www added
- [ ] robots.txt and sitemap.xml show the real domain
- [ ] Search Console and Bing verified, sitemap submitted
- [ ] PageSpeed mobile ≥ 90, accessibility 100
## Operations
- [ ] Who answers users, and when
- [ ] Stop-rule numbers written down
```

---

## 17. First message for a new project

```text
Follow the build playbook (playbook.md).
Idea: [one paragraph]. Users: [who]. Language: Bangla first, English second.
My research: [attached / in the project files].

1. Research gaps with parallel agents (fact sheets: source, date, HIGH/MEDIUM/LOW, could-not-verify).
2. Write docs/project-brief.md and docs/plan.md for Phase 1 only.
3. Stop and wait for my approval.
4. Then build task by task with the loop, rubric ≥ 4 on all eight items, screenshots on phone and desktop,
   every loop logged and decisions recorded.
Deploys, domains, keys, money and anything that cannot be undone are my decision.
```
