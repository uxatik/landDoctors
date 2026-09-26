# Designfoli Design System

**Version:** 1.0.0  
**Last Updated:** May 2024

---

## Overview

**Designfoli** is a web application for UX designers to create, structure, and publish portfolio case studies. The core product allows designers to easily build professional landing pages and case study collections — showcasing their work in a polished, structured way.

**Sources provided:**
- `uploads/DesignFoli Design system.png` — Full design system reference sheet (dark + light theme, side by side). This is the primary source of truth for all visual decisions.

---

## Products / Surfaces

| Surface | Description |
|---|---|
| **Web App** | The main SaaS product — a case study builder and portfolio publisher for UX designers |
| **Marketing Site** | Landing page / homepage promoting the product |

Both surfaces share this design system. The web app has a strong dark-mode identity; the marketing site supports both themes.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct and empowering** — speaks to designers as capable professionals
- **Action-oriented** — CTAs use verbs: "Get Started", "Learn More", "Try Now →"
- **Concise** — headlines are short, punchy. No padding text.
- **First-person minimal** — avoids overusing "I" or "we"; speaks to the *you* (the designer)
- **Professional but not stiff** — warm, confident, not corporate

### Casing
- Headlines: **Title Case** for major headings ("Build Better. Faster. Together.")
- UI labels: **Sentence case** ("Get started", "Learn more") — occasionally Title Case for CTAs
- Navigation: Title Case
- Body copy: Standard sentence case

### Copy Examples (from design system sheet)
- Hero: *"Build better. Faster. Together."*
- Subtitle: *"Use this system to create intuitive and beautiful user experiences."*
- Card headline: *"Design at the speed of AI"*
- Card body: *"Transform ideas into UI designs for mobile and web applications."*
- CTA: *"Try Now →"* / *"Learn More →"*

### Emoji & Special Characters
- **No emoji** in the product UI
- Arrow glyph `→` used in CTAs and links
- `+` icon used in icon buttons (not emoji)

### Writing Vibe
Confident, modern, product-focused. Feels like a premium SaaS tool for professionals. Not playful, not enterprise-heavy — squarely in the "modern design tool" space (think Framer, Notion, Figma).

---

## VISUAL FOUNDATIONS

### Color Philosophy
Dual-theme system: **dark (primary)** and **light**. Dark theme is the hero identity — deep navy backgrounds with violet-purple primary accents. Light theme is clean and minimal.

#### Dark Theme
| Role | Hex |
|---|---|
| Primary 500 | `#6B5CFF` |
| Primary 400 | `#8A7BFF` |
| Primary 600 | `#5746E5` |
| Background Base | `#0B0F1A` |
| Background Surface | `#12172A` |
| Background Elevated | `#1A2038` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A0A8C0` |
| Text Muted | `#6B7280` |

#### Light Theme
| Role | Hex |
|---|---|
| Primary 500 | `#5B4FFF` |
| Primary 400 | `#7C72FF` |
| Primary 600 | `#4338CA` |
| Background Base | `#FFFFFF` |
| Background Surface | `#F8FAFC` |
| Text Primary | `#0F172A` |
| Text Secondary | `#475569` |
| Text Muted | `#94A3B8` |

#### Neutral Scale (Dark Theme reference)
`#08081F` → `#131533` → `#1A2042` → `#2F3156` → `#717178` → `#8B8B94` → `#ABACB4` → `#D4D4DC` → `#F0F0F5` → `#FFFFFF`

#### Semantic Colors
| Name | Hex |
|---|---|
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |
| New/Feature | `#A855F7` |

#### Gradient
Primary gradient: `#5B64FF → #A857F7` (violet to purple, used in hero backgrounds and glows)

### Typography
**Font Family:** Mona Sans, system-ui, sans-serif (self-hosted TTFs in `fonts/`)  
**Width variants:** Condensed (75%), SemiCondensed (87.5%), Regular (100%), SemiExpanded (112.5%), Expanded (125%)  
**Weights available:** 200 ExtraLight → 900 Black, with matching italics

| Style | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| Display | 64px | 72px | 700 | Hero / Landing |
| H1 | 48px | 56px | 700 | Page Titles |
| H2 | 36px | 44px | 600 | Section Titles |
| H3 | 24px | 32px | 600 | Subsection |
| Body Large | 18px | 28px | 400 | Large Body Text |
| Body | 16px | 24px | 400 | Default Body |
| Body Small | 14px | 20px | 400 | Supporting Text |
| Caption | 12px | 18px | 400 | Captions / Labels |

Minimum body text: **16px**. No serif or mono fonts in the product UI.

### Spacing & Layout
- Base unit: **8px** grid
- Component padding follows 8px multiples: 8, 16, 24, 32, 48, 64px
- Cards: internal padding ~24px
- Section padding: 64–96px vertical

### Backgrounds
- Dark theme: deep navy solid backgrounds, no textures
- Gradient panels used for hero/marketing sections (violet glow)
- Cards use slightly elevated background color (not white borders)
- No patterns, no illustrations in UI — clean flat surfaces

### Cards
- Background: `#12172A` (dark) / `#F8FAFC` (light)
- Border-radius: **12px**
- Subtle border: 1px solid with low-opacity white/black
- No heavy drop shadows on cards — elevation via background color difference
- Content: icon (sparkle/star), headline, body, CTA link

### Borders & Radius
- Buttons: fully rounded (pill) or `8px` for medium
- Cards: `12px`
- Inputs: `8px`
- Badges/tags: fully rounded pill
- Focus ring: `2px` solid primary color

### Shadows & Elevation
Five levels: **Sm, Md, Lg, Xl, Glow**
- Sm: `0 1px 3px rgba(0,0,0,0.3)` — subtle lift
- Md: `0 4px 12px rgba(0,0,0,0.35)` — cards
- Lg: `0 8px 24px rgba(0,0,0,0.4)` — modals, dropdowns
- Xl: `0 16px 48px rgba(0,0,0,0.5)` — overlays
- Glow: `0 0 24px rgba(107,92,255,0.5)` — primary color glow for CTAs/highlights

### Animation
- Transitions: `150–200ms ease-out` for hover states
- No bounce or spring animations in UI
- Subtle opacity + translate for fade-ins
- Focus states: immediate (no transition delay)

### Hover States
- Primary buttons: lighten background (→ `#8A7BFF`)
- Secondary buttons: fill background with low-opacity primary
- Links: opacity 0.8 or color shift to primary
- Cards: subtle border highlight, slight elevation increase

### Press / Active States
- Buttons: darken (→ `#5746E5`), slight scale `0.98`

### Transparency & Blur
- Dropdown/modal overlays: `backdrop-filter: blur(12px)` with semi-transparent bg
- Used sparingly — only for overlay surfaces

### Imagery
- No photography in the UI system
- Icons are clean, minimal stroke-based (Lucide style)
- Sparkle / star icons used as decorative card markers
- No illustrations

---

## ICONOGRAPHY

**Style:** Clean, minimal, 1.5–2px stroke weight, rounded caps — consistent with Lucide Icons  
**CDN:** [Lucide Icons](https://lucide.dev) — available via `https://unpkg.com/lucide@latest`  
**Usage:** Icons appear in:
- Icon buttons (`+` add, arrows)
- Input field leading icons (email envelope)
- Card decorative marks (sparkle `✦`)
- Toggle labels (App / Web)
- Design principle icons (shield, link, chart, star, users)

**No icon font** — icons are SVG inline or via Lucide CDN  
**No emoji** in UI  
**Arrow glyph** `→` used as text CTA suffix

### Key Icons Used
| Context | Icon |
|---|---|
| Portfolio/Case Study | Sparkle / Star |
| Email input | Envelope |
| Dropdown | Chevron Down |
| Add | Plus |
| Accessible | Shield |
| Consistent | Link |
| Scalable | Bar Chart |
| Delightful | Star |
| Collaborative | Users |

---

## File Index

```
README.md                        ← You are here
SKILL.md                         ← Agent skill descriptor
colors_and_type.css              ← All CSS custom properties (colors, type, spacing, shadows)
assets/                          ← Brand assets (logo SVG, icons)
preview/                         ← Design system preview cards (shown in Design System tab)
  colors-brand.html
  colors-neutral.html
  colors-semantic.html
  colors-gradient.html
  type-scale.html
  type-specimens.html
  spacing-tokens.html
  shadows.html
  buttons.html
  inputs.html
  cards.html
  badges-toggles.html
ui_kits/
  web_app/
    README.md
    index.html                   ← Interactive UI kit (case study builder app)
    NavBar.jsx
    Sidebar.jsx
    CaseStudyCard.jsx
    HeroSection.jsx
    Dashboard.jsx
```

---

*Designfoli Design System v1.0.0 — May 2024*
