# namethreat — Design System
> Version 1.0 — March 2026

---

## Design Philosophy

**"Serious intelligence tool. Not a marketing website."**

- Monochrome first — black, white, and grays only
- Color is reserved for risk signals only (never decoration)
- Rounded corners, generous spacing, clean cards
- Feels like Linear/Vercel/Notion but with the data density of a security dashboard
- No gradients. Shadows used intentionally for depth — cards have shadow-sm, hover reveals shadow-md. No flat UI.

---

## Color Tokens

```css
/* Base */
--color-bg:           #ffffff;   /* page background */
--color-bg-secondary: #f5f5f5;   /* sidebar, card hover, input bg */
--color-bg-subtle:    #fafafa;   /* inner card sections, table rows */

/* Text */
--color-text-primary:   #0a0a0a; /* headings, labels */
--color-text-secondary: #6b6b6b; /* subtext, captions, timestamps */
--color-text-muted:     #a3a3a3; /* placeholders, disabled */

/* Borders */
--color-border:        #e5e5e5;  /* default borders */
--color-border-strong: #d4d4d4;  /* table headers, dividers */

/* Interactive */
--color-black:  #0a0a0a;  /* primary buttons, active sidebar item */
--color-white:  #ffffff;  /* button text on black */

/* Risk Colors — ONLY use for actual risk/status signals */
--color-risk-high:    #ef4444;  /* high risk, danger */
--color-risk-medium:  #f97316;  /* medium risk, warning */
--color-risk-low:     #22c55e;  /* low risk, healthy */
--color-risk-info:    #3b82f6;  /* informational */

/* Status badges */
--color-badge-high-bg:    #fef2f2;
--color-badge-high-text:  #ef4444;
--color-badge-medium-bg:  #fff7ed;
--color-badge-medium-text:#f97316;
--color-badge-low-bg:     #f0fdf4;
--color-badge-low-text:   #22c55e;
--color-badge-neutral-bg: #f5f5f5;
--color-badge-neutral-text:#6b6b6b;
```

### Tailwind mapping
Use these Tailwind classes consistently:

| Token | Tailwind class |
|---|---|
| Page bg | `bg-white` |
| Secondary bg | `bg-neutral-100` |
| Subtle bg | `bg-neutral-50` |
| Primary text | `text-neutral-950` |
| Secondary text | `text-neutral-500` |
| Muted text | `text-neutral-400` |
| Border | `border-neutral-200` |
| Strong border | `border-neutral-300` |
| Black button | `bg-neutral-950 text-white` |
| Active nav item | `bg-neutral-950 text-white` |

---

## Typography

```
Font family: Inter (already loaded via Next.js)
Fallback: -apple-system, BlinkMacSystemFont, sans-serif
```

| Element | Size | Weight | Class |
|---|---|---|---|
| Page title | 28px / 1.75rem | 700 | `text-2xl font-bold text-neutral-950` |
| Section heading | 20px / 1.25rem | 600 | `text-xl font-semibold text-neutral-950` |
| Card title | 16px / 1rem | 600 | `text-base font-semibold text-neutral-950` |
| Body text | 14px / 0.875rem | 400 | `text-sm text-neutral-950` |
| Secondary / label | 13px / 0.8125rem | 400 | `text-[13px] text-neutral-500` |
| Micro label (caps) | 11px / 0.6875rem | 500 | `text-[11px] font-medium uppercase tracking-wider text-neutral-500` |
| Stat number | 32px / 2rem | 700 | `text-[32px] font-bold text-neutral-950` |

**Micro labels** (like "CORE BEHAVIORAL METRICS", "ACTIVE CAMPAIGNS") always use:
`text-[11px] font-medium uppercase tracking-wider text-neutral-500`

---

## Spacing & Layout

```
Base unit: 4px (Tailwind default)

Page padding:     px-6 py-6  (24px)
Card padding:     p-5        (20px) or p-6 (24px) for larger cards
Card gap:         gap-4      (16px) standard, gap-6 (24px) for section spacing
Section gap:      gap-8      (32px)
Sidebar width:    w-64       (256px)
Content max-width:max-w-7xl  (1280px)
```

---

## Border Radius

This is critical for the "modern 2026 SaaS" feel.

```
Cards:          rounded-xl    (12px)
Buttons:        rounded-lg    (8px) for standard, rounded-full for pill buttons
Input fields:   rounded-lg    (8px)
Badges:         rounded-full  (pill shape)
Sidebar active: rounded-lg    (8px)
Modal:          rounded-2xl   (16px)
Avatars:        rounded-full
```

---

## Shadows

Shadows add depth and make the UI feel finished. Use them intentionally.

```
Cards (standard):       shadow-sm
Cards (hover state):    shadow-md  (on hover, with transition)
Stat cards:             shadow-sm, hover:shadow-md
Modals / popovers:      shadow-xl
Dropdowns:              shadow-lg
Buttons:                no shadow
Sidebar:                no shadow (border-r is enough)
Table rows:             no shadow
```

```css
/* Tailwind shadow scale reference */
shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)   /* default cards */
shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)   /* hover cards */
shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05) /* dropdowns */
shadow-xl:  0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.06) /* modals */
```

Card hover pattern (makes cards feel interactive and alive):
```
className="... shadow-sm hover:shadow-md transition-shadow duration-200"
```

---

## Components

### Sidebar

```
Width: 256px (w-64)
Background: bg-white
Right border: border-r border-neutral-200
Padding: px-3 py-4

Workspace switcher (top):
  - Rounded square logo + org name + chevron
  - bg-neutral-100 rounded-lg p-2
  - font-semibold text-sm

Section label:
  - text-[11px] font-medium uppercase tracking-wider text-neutral-400
  - px-3 py-2 mt-4 mb-1

Nav item (default):
  - flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-600
  - hover: bg-neutral-100 text-neutral-950
  - transition-colors duration-150

Nav item (active):
  - bg-neutral-950 text-white rounded-lg
  - font-medium

Icons:
  - Lucide icons, size 16px (h-4 w-4)
  - Stroke width: 1.5
```

### Cards

```
Standard card:
  bg-white rounded-xl border border-neutral-200 shadow-sm p-5
  hover: shadow-md transition-shadow duration-200

Stat card (dashboard KPI):
  bg-white rounded-xl border border-neutral-200 shadow-sm p-5
  hover: shadow-md transition-shadow duration-200
  - Icon: small rounded-lg bg-neutral-100 p-2 flex items-center justify-center (top left)
  - Micro label: text-[11px] uppercase tracking-wider text-neutral-500
  - Big number: text-[32px] font-bold text-neutral-950
  - Trend indicator: text-[13px] with green/red arrow for direction
  - Status badge at bottom: rounded-full pill

  Icon backgrounds on stat cards (subtle tint, not full color):
    Risk/alert icons:   bg-red-50 text-red-500
    Activity icons:     bg-neutral-100 text-neutral-600
    Success icons:      bg-green-50 text-green-600
    Info icons:         bg-blue-50 text-blue-500

Subtle inner section:
  bg-neutral-50 rounded-lg p-4
```

### Buttons

```
Primary (black):
  bg-neutral-950 text-white text-sm font-medium
  px-4 py-2 rounded-lg
  hover:bg-neutral-800
  transition-colors duration-150

Secondary (outline):
  border border-neutral-200 bg-white text-neutral-950 text-sm font-medium
  px-4 py-2 rounded-lg
  hover:bg-neutral-50

Destructive:
  bg-red-500 text-white text-sm font-medium
  px-4 py-2 rounded-lg
  hover:bg-red-600

Icon button:
  p-2 rounded-lg text-neutral-500
  hover:bg-neutral-100 hover:text-neutral-950

Small / compact:
  px-3 py-1.5 text-xs rounded-md
```

### Badges / Status Pills

```
High risk:   bg-red-50 text-red-500 text-[11px] font-medium px-2 py-0.5 rounded-full uppercase
Medium risk: bg-orange-50 text-orange-500 text-[11px] font-medium px-2 py-0.5 rounded-full uppercase
Low risk:    bg-green-50 text-green-600 text-[11px] font-medium px-2 py-0.5 rounded-full uppercase
Neutral:     bg-neutral-100 text-neutral-500 text-[11px] font-medium px-2 py-0.5 rounded-full uppercase
```

### Input Fields

```
border border-neutral-200 bg-white rounded-lg px-3 py-2 text-sm
placeholder:text-neutral-400
focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent
```

### Tables

```
Table wrapper: bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden

Header row:
  bg-neutral-50 border-b border-neutral-200
  th: px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500

Body row:
  border-b border-neutral-100 last:border-0
  td: px-4 py-3 text-sm text-neutral-950
  hover: bg-neutral-50

No zebra striping.
```

### Page Header

```
Every page has a consistent header block:

<div class="mb-6">
  <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-500 mb-1">
    SECTION NAME  {/* e.g. "SIMULATIONS" or "OPERATIONS CENTER" */}
  </p>
  <h1 class="text-2xl font-bold text-neutral-950">Page Title</h1>
  <p class="text-sm text-neutral-500 mt-1">Short description of what this page does.</p>
</div>
```

### Empty States

```
Centered in card, py-12:
- Lucide icon, h-8 w-8 text-neutral-300
- Title: text-sm font-medium text-neutral-950 mt-3
- Description: text-sm text-neutral-500 mt-1
- CTA button (optional): mt-4, primary or outline style
```

---

## Icons

Use **Lucide React** exclusively.

```
Standard size:  h-4 w-4  (16px) — nav items, inline, buttons
Medium size:    h-5 w-5  (20px) — card icons, empty states header
Large size:     h-8 w-8  (32px) — empty states, feature callouts

Stroke width: always 1.5 (default Lucide)
Color: inherit from parent text color
```

Never use emoji as icons. Never use filled/solid icon styles.

---

## Risk Score Display

The circular risk score gauge:

```
Outer ring stroke color based on score:
  80-100: stroke-red-500
  60-79:  stroke-orange-500
  40-59:  stroke-yellow-500
  0-39:   stroke-green-500

Center number: text-[40px] font-bold text-neutral-950
Label below:   text-[11px] uppercase tracking-wider text-neutral-500
```

---

## Cursor Prompting Guide

### How to use this document

1. Drop `DESIGN_SYSTEM.md` into your project root
2. At the start of every redesign prompt in Cursor, write: `Read DESIGN_SYSTEM.md first, then...`
3. Cursor will read the file and apply the tokens automatically

### Recommended redesign order

Start with shared components — they propagate everywhere:

1. `Sidebar.tsx` — biggest visual impact, used on every page
2. `tailwind.config.ts` — add any custom tokens if needed
3. `globals.css` — set Inter font, base body styles
4. Stat/KPI cards — reused on dashboard and client pages
5. Tables — reused on employees, campaigns, results
6. Buttons & badges — quick sweep across all pages
7. Individual pages — mostly fixed once components are done

### Example Cursor prompt

```
Read DESIGN_SYSTEM.md first.

Redesign the Sidebar component at src/components/Sidebar.tsx using this design system.

Requirements:
- Keep all existing navigation links, routes, and role-based logic completely untouched
- Only change the visual layer: classNames, layout, structure
- Sidebar sections: use the section label pattern (11px uppercase tracking-wider)
- Active item: black pill (bg-neutral-950 text-white rounded-lg)
- Workspace switcher at top for MSP org switcher
- Lucide icons, h-4 w-4, stroke 1.5
- Use Tailwind only, no custom CSS
```

---

## What NOT to do

- No gradients (`bg-gradient-*`)
- No colored card backgrounds — white only, or `bg-neutral-50` for subtle sections
- No purple, blue, indigo, or brand accent colors anywhere except risk indicators
- No `shadow-xl` on cards — reserve it for modals only
- No border-radius below `rounded-lg` (8px minimum everywhere)
- No font sizes below 11px
- No colored sidebar items — active state is black pill only
- No animations except `transition-colors duration-150` on interactive elements
- No solid color icon backgrounds (the colored circle behind icons in the AI mockups — skip this)
