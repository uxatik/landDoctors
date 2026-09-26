# LandDoctor — notes for Claude

## Design system: Designfoli (mandatory)
- Always follow .claude/skills/designfoli/README.md and designfoli-brand.json.
- Primary colour: #5A6BFF. Gradient: #5A6BFF → #A857F7. No other brand colours.
- Font: Mona Sans only. Use no serif or mono fonts in brand materials.
- Use the CSS variables in colors_and_type.css (--color-primary-*, --bg-*, --fg-*, --space-*, --radius-*, --shadow-*). Never hard-code new hex values.
- 8px spacing grid. Cards 12px radius. Pill buttons and badges.
- Dark theme (#0B0F1A navy) is the signature look. Light theme is supported.
- Voice: direct, confident, concise. Verb-led CTAs with the → glyph. No emoji in the UI.
- For LinkedIn or social graphics, use the "linkedin" section of designfoli-brand.json (sizes, templates, 64px safe margins).

## How Designfoli is applied in this project
- The site uses Designfoli's light theme (`styles/designfoli.css`, loaded in `app/globals.css` in the base CSS layer).
- `design/tokens.css` maps LandDoctor's token names onto Designfoli variables. Components use those names through Tailwind (e.g. `bg-accent`, `rounded-card`), never raw hex values.
- Mona Sans has no Bangla letters, so the font stack is Mona Sans → Hind Siliguri. Latin text and digits render in Mona Sans; Bangla in Hind Siliguri.
- Contrast (WCAG AA) overrides: filled buttons and links use `--color-primary-600`; semantic text colours are darker shades of Designfoli's semantic colours via `color-mix`. See docs/decisions.md D11.
- Tailwind was already part of this project before Designfoli was installed; don't add any other UI library.

## Project
- Plan: docs/plan.md · Decisions: docs/decisions.md · Log: docs/loop-log.md · Launch: docs/launch-checklist.md
- Checks: `npm run check` (types, lint, unit, database) and `npm run e2e`.
- Bangla is the default language; every string exists in messages/bn.json and messages/en.json.
