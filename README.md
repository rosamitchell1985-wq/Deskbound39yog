# Deskbound

Static site. Five-minute desk mobility routines for US office and remote workers with
lower back, neck and hip pain from sitting.

## Stack

Plain HTML5, one CSS file, one JS file. No framework, no bundler, no build step, no
third-party scripts or stylesheets. Fonts are self-hosted.

Open `index.html` directly from disk and everything works, including the timer:

- all paths are relative (`./assets/...`)
- classic `<script src>` only — no ES modules, no `type="module"`
- no `fetch()`, no `XMLHttpRequest`, no JSON files; all data lives in `assets/js/main.js`
- no service worker
- every `localStorage` read and write is wrapped in try/catch with an in-memory fallback,
  because Safari throws on storage access over `file://`

## Files

```
index.html            hero, timer, four routines, testimonials, FAQ, newsletter
routines.html         content page — the four routines in full, cues and mistakes
posture.html          content page — why sitting hurts, desk setup, 20-8-2 rule
about.html            who publishes this, how it's funded, what it won't claim
contact.html          form (client-side only in this build) + real address and phone
404.html              not found, noindex, no ads
privacy-policy.html   CCPA/CPRA and broader US state privacy law, GPC, Google ads
cookie-policy.html    every cookie and storage key, by category
terms.html            acceptable use, assumption of risk, liability, Idaho law
disclaimer.html       health disclaimer and the red-flag symptom list
accessibility.html    WCAG 2.2 AA target, ADA Title III, known gaps, contact
assets/css/style.css  the whole design system
assets/js/main.js     storage, nav, consent, routine data, timer, forms
assets/fonts/         Inter Tight variable woff2, latin + latin-ext subsets
robots.txt  sitemap.xml  site.webmanifest  favicon.svg  apple-touch-icon.png  ads.txt
DESIGN.md             palette, type, wireframes, the three principles
```

`assets/img/` is intentionally empty — see below.

## Images

All photographs are hotlinked from Pexels (`images.pexels.com`), which permits
hotlinking and commercial use. Every URL in the markup was verified to return HTTP 200
and every photo was visually checked to match its alt text.

**Before production launch, download these photos and self-host them under
`assets/img/`, then update the `src`/`srcset` attributes.** Hotlinking a third-party
CDN is fine for a build but it is a dependency you do not control: they can rename,
remove or rate-limit at any time. Keep the same `?w=` breakpoints (400 / 800 / 1200 /
1600) when you generate local files so `sizes` stays accurate.

Photo IDs currently in use: 8468502, 5239956, 9158773, 4962588, 8546622, 8546652,
3966781, 17783401, 10321963, 8001034, 3990502, 15946547, 12311572, 13188831.

## Fonts

`assets/fonts/inter-tight-latin.woff2` and `inter-tight-latin-ext.woff2` are the
variable Inter Tight subsets served by Google Fonts, downloaded for self-hosting.
Inter Tight is licensed under the SIL Open Font License 1.1. Keep the license file with
the fonts if you redistribute them.

## Advertising

**There are no ad slots in this build.** They were removed on request: the markup is
gone from `index.html`, `routines.html` and `posture.html`, the `.ad-slot` rules are out
of `style.css`, and the hook that hid slots on newsletter success is out of `main.js`.
The site currently serves no advertising and has no ad-related layout reserved.

`ads.txt` and the consent banner are still in place, and the privacy and cookie policies
still describe how advertising vendors would be handled. That is deliberate — the
consent plumbing is the part that is expensive to retrofit — but **if this site ships
permanently ad-free, those disclosures should be trimmed so they do not describe
processing that never happens.** Say the word and they go.

If ads are reinstated later, put them back as:

```html
<aside class="ad-slot" aria-label="Advertisements">
  <div class="wrap">
    <p class="ad-slot__label">Advertisements</p>
    <div class="ad-slot__box"><!-- ad tag --></div>
  </div>
</aside>
```

Three per content page maximum (after the first content section, mid-page, above the
footer), never in the hero, never inside the timer, `min-height` reserved at every
breakpoint so CLS stays at zero, 40px clear of any tappable control on a 390px screen,
and the label wording must be exactly "Advertisements" or "Sponsored links". Then:

1. Put your publisher ID in `ads.txt` and uncomment the line.
2. Load a Google-certified CMP (TCF v2.3) at the marked integration point in
   `applyConsent()` in `main.js` — required for EEA/UK/Swiss traffic even on a
   US-targeted site.
3. Request ad tags only after the CMP resolves. With `db_consent === "rejected"`, or
   when the Global Privacy Control signal is present, request non-personalized ads only.

## Consent

Real Accept / Reject banner with two equally weighted buttons, stored in
`localStorage` under `db_consent`. A persistent "Cookie settings" link in every footer
reopens it. "Do Not Sell or Share My Personal Information" writes the same rejected
state and confirms in place. `navigator.globalPrivacyControl === true` is honored as an
opt-out and suppresses the banner entirely.

## The timer

`Timer` in `main.js`. Five moves, sixty seconds each.

Elapsed time is always `Date.now() - startAt`. `setInterval` only schedules repaints at
250ms — it never accumulates time — so backgrounding the tab, locking the phone, or
dropping frames cannot make the clock drift. `visibilitychange` and `pageshow` force an
immediate re-render on return.

Transitions are announced through a polite `aria-live` region and optionally beeped via
Web Audio. **Sound defaults to off**; the context is created lazily on the first user
gesture, so Safari's autoplay policy is never violated. If Web Audio is unavailable the
timer runs and announces normally.

Deep links: `index.html#reset-hips` (or `-neck`, `-shoulders`, `-lower-back`) loads that
routine straight into the timer.

## Forms

Nothing is transmitted in this build. Both forms validate in the browser, then show a
local confirmation. Wire them to a real endpoint before launch and update the note in
the privacy policy naming the processor.

## Printing

Print styles are US Letter (`@page { size: letter }`). Navigation, footer, ads, consent
banner and the timer controls drop out; routine lists and tables avoid breaking across
pages. `routines.html` is the page worth printing.

## Checks worth re-running after any edit

- Open `index.html` from `file://` with the network off — the timer must still run.
- Tab through every page: skip link first, visible focus ring everywhere, no traps.
- 390px wide, then 320px at 400% zoom — no horizontal page scroll.
- Every image URL still returns 200.
