# Deskbound — design plan

Five-minute mobility breaks for people who sit for a living. The site has to read
like a tool a skeptical 42-year-old engineer would keep in a browser tab, not like
a studio. Dark, dense, honest about what it is.

---

## 1. Palette — five named colors

| Token | Hex | Role |
|---|---|---|
| `--bg` Charcoal | `#16181D` | Page base. Everything sits on this. |
| `--panel` Slate | `#1F232B` | Cards, the timer housing, the nav drawer. One step up from base. |
| `--ink` Off-white | `#E8EAED` | Body and headings. Never pure white. |
| `--signal` Signal blue | `#4C8DFF` | The single accent: active chip, Start button, links, focus ring. |
| `--warn` Warning amber | `#E0A33E` | Pain markers only. Nothing else is ever amber. |

Support tokens (derived, not "brand colors"): `--line #2A2F38` for every 1px border,
`--muted #97A0AE` for meta text and data-cell labels, `--panel-2 #262B34` for the
inside of a data cell.

Contrast check against `#16181D`:
`#E8EAED` = 13.9:1 (body, pass AAA). `#97A0AE` = 6.6:1 (meta, pass AA).
`#4C8DFF` = 6.0:1 (links and large UI, pass AA). `#E0A33E` = 8.5:1 (pass AA).
On `#1F232B` panels every one of those stays above 4.5:1. Signal blue is only ever
used as *text on dark* or as a *fill behind #16181D text* (`#4C8DFF` bg + `#101216`
text = 6.4:1), never as light-on-blue at body size.

Light theme is intentionally **not** shipped. The brand is dark; a
`prefers-color-scheme: light` inversion would weaken it and double the QA surface.
`color-scheme: dark` is declared so form controls and scrollbars follow.

## 2. Type — one family, two weights

**Inter Tight**, self-hosted variable woff2 (`assets/fonts/inter-tight-latin.woff2`),
`font-display: swap`, system grotesque fallback (`-apple-system` → `Segoe UI` →
`Helvetica Neue` → `Arial`).

- **700** — h1/h2/h3, chip labels, button text, the exercise name in the widget.
  Tight tracking (`-0.02em`) at display sizes.
- **400** — all body copy, all data cells, all meta. `line-height: 1.6`.
- **500** — used sparingly for table headers and data-cell keys.

No serif anywhere. No italics except the `<cite>` in testimonials. All numerals
`font-variant-numeric: tabular-nums` sitewide so durations, dates and the countdown
never jitter.

**One documented exception:** the countdown readout uses the system monospace stack
(`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`). The brief
asks for a big monospace timer, and a real fixed-pitch face reads as instrumentation
in a way a proportional sans with tabular figures does not. It is the only element
on the site not set in Inter Tight.

## 3. Hero wireframe (390px iPhone, the primary target)

```
┌──────────────────────────────────────────────┐
│ DESKBOUND ▮                          [≡]     │  56px bar, 1px bottom rule
├──────────────────────────────────────────────┤
│                                              │
│  ▒▒ photo: office worker mid side-bend ▒▒    │  photo at 18% opacity behind a
│  ▒▒ under a #16181D 88% overlay        ▒▒    │  charcoal wash + top/bottom
│                                              │  linear-gradient to solid
│  Your back hurts because                     │  h1 700 / 34px / -0.02em
│  you sit for a living.                       │  left-aligned, full-bleed pad 20px
│                                              │
│  Five minutes, at your desk, in the          │  400 / 17px / --muted
│  clothes you're already wearing.             │
│                                              │
│  ┌──────┬──────────┬────────────┬───────┐    │  chip row, scroll-snap x
│  │ Neck │Shoulders │ Lower back │ Hips  │ →  │  48px tall, 4px radius,
│  └──────┴──────────┴────────────┴───────┘    │  1px --line, active = blue fill
│   ●───────────────────────────────────       │  scrollbar hidden, momentum on
│                                              │
│  [ Start the 5-minute reset ]                │  56px, signal blue, full width
│  No signup. Works offline.                   │  13px --muted
└──────────────────────────────────────────────┘
```

At ≥900px the same block is left-aligned in a 640px column against the photo, which
gets to be seen more (overlay drops to 76%). The layout does not center. Ever.

## 4. Content section wireframe — a routine card

```
┌────────────────────────────────────────────────┐
│ LOWER BACK                            ▲ amber  │  h3 700 / amber pain marker
│ Five moves for the ache that starts at 3pm.    │  400 / 16px
│ ┌────────────┬────────────┬──────────────────┐ │  the three-cell data row:
│ │ DURATION   │ POSITION   │ EQUIPMENT        │ │  labels 11px 500 --muted,
│ │ 5:00       │ Seated +   │ None             │ │  values 15px 400 --ink,
│ │            │ standing   │                  │ │  1px --line between cells
│ └────────────┴────────────┴──────────────────┘ │  cell bg --panel-2
│                                                │
│  01  Seated cat-cow                     1:00   │  ordered list, tabular nums,
│  02  Standing forward fold              1:00   │  1px --line between rows
│  03  Hip flexor stretch at the desk     1:00   │
│  04  Seated figure-4                    1:00   │
│  05  Glute bridge (floor optional)      1:00   │
│                                                │
│  [ Load into timer ]                           │  56px, outlined, blue text
└────────────────────────────────────────────────┘
```

## 5. Three principles specific to this brand

1. **Data before prose.** Every routine, every move, leads with the three facts a
   person between meetings needs — how long, sitting or standing, what equipment.
   The paragraph comes after. If a section can't state its facts in a three-cell
   row, it probably doesn't belong on the page.

2. **Depth from edges, not light.** `box-shadow` appears nowhere in style.css. Layers
   are separated by a 1px `#2A2F38` rule and a single step of background tint
   (`#16181D` → `#1F232B` → `#262B34`). Radius is 4px on everything, or 0. This is
   the rule that keeps the site from looking like a wellness app.

3. **The thumb is the primary input.** Controls the user touches under time pressure
   are 56px tall with 8px gaps; nothing important is behind a hover; the region chips
   scroll-snap so a half-swipe still lands on a whole chip. Anything that only works
   with a mouse is a bug.

## 6. Checked against the generic tells

- Cream + serif + terracotta — **no**, dark charcoal + one grotesque + blue.
- Identical rounded cards with soft gray shadows — **no shadows at all**, 4px radius,
  cards differ by role (data cell vs routine card vs callout are visibly distinct).
- All-caps tracked-out eyebrows above every heading — used **once**, on the amber pain
  marker inside routine cards, where it functions as a label rather than decoration.
- "→" glued to button text, meta joined with middle dots — **no**; buttons state a
  verb, meta is a bordered three-cell grid.
- Fade-and-slide-up on every section — **no entrance animation anywhere**. The only
  motion on the site is the timer's progress segments filling and the pressed state
  on controls, and both are disabled under `prefers-reduced-motion`.

**Where the boldness is spent:** the timer. It is oversized, monospace, and takes the
full width of the phone. Everything else on the site stays quiet on purpose.
