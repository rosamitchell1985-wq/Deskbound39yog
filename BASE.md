# Shared build spec

## Stack
- Static HTML5 + one vanilla CSS file + one vanilla JS file. No React, no Tailwind, no build step, no bundler.
- No third-party CDN scripts or stylesheets. Self-host fonts in /assets/fonts as .woff2 with font-display:swap, or use a system stack. (Hotlinked photos are the one exception — see the Images section.)
- **The site must work when index.html is opened directly from disk**, with no server. This is the no-build-step test. To pass it:
  - Relative paths everywhere: `./assets/css/style.css`, never `/assets/css/style.css`. Root-absolute paths break on `file://`.
  - Classic `<script src="...">` tags only. No `type="module"`, no `import`/`export` — browsers block ES modules on `file://` as a cross-origin request.
  - No `fetch()` or `XMLHttpRequest` against local files. Any data the site needs (pose lists, sequences, FAQ content) lives in the HTML or in a plain JS object in main.js, not in a separate .json file.
  - No service worker. It requires https or localhost.
  - `localStorage` is unreliable on `file://` — Safari in particular may throw. Wrap every read and write in try/catch with an in-memory object as fallback, so the widget still works for the session even when storage is blocked. Never let a storage failure throw an uncaught error and break the page.
- Every page under 150KB of HTML+CSS+JS combined (excluding images).

## File structure
index.html, about.html, contact.html, 404.html
[two niche content pages — named in the site prompt]
privacy-policy.html, cookie-policy.html, terms.html, disclaimer.html, accessibility.html
assets/css/style.css
assets/js/main.js
assets/img/ (see the Images section below — photos are hotlinked, not stored locally)
robots.txt, sitemap.xml, site.webmanifest, favicon.svg, apple-touch-icon.png (180x180)

## iPhone / Mobile Safari requirements — non-negotiable
- Design mobile-first at 390px (iPhone 15/16 logical width), then scale up. Test mentally at 375px and 430px too.
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Respect the notch and home indicator: `padding: env(safe-area-inset-top) env(safe-area-inset-right) calc(env(safe-area-inset-bottom) + 12px) env(safe-area-inset-left)` on fixed headers, sticky CTAs and the footer.
- Use `100svh` / `100dvh` for full-height sections, never `100vh` — Safari's toolbar collapse breaks it.
- ALL form inputs, selects and textareas: `font-size: 16px` minimum, or iOS auto-zooms on focus.
- Tap targets minimum 44x44 CSS px per Apple HIG, with at least 8px between adjacent targets.
- `-webkit-tap-highlight-color: transparent` plus a visible `:active` state, so taps still feel responsive.
- No hover-only interactions. Anything reachable on hover must also be reachable by tap and by keyboard.
- Add `-webkit-text-size-adjust: 100%` and let iOS Dynamic Type scale — size body text in `rem`, never `px`.
- Momentum scrolling on any horizontal scroller: `overflow-x:auto; -webkit-overflow-scrolling:touch; scroll-snap-type:x mandatory;` and hide the scrollbar.
- Images use `srcset` + `sizes` with the CDN's width params so iPhones pull a 400w or 800w file, `loading="lazy"` `decoding="async"` below the fold, explicit width/height to stop layout shift. See the Images section.
- Avoid `background-attachment: fixed` and large `backdrop-filter` areas — both stutter badly on iOS.
- Add to the head: `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`, and two `theme-color` metas with `media="(prefers-color-scheme: light)"` and `dark`.
- Inputs get correct `type`, `inputmode`, `autocomplete` (`email`, `name`, `tel`) so iOS shows the right keyboard and autofills.
- Honour `@media (prefers-reduced-motion: reduce)` — kill all animation, keep functionality.
- Support `@media (prefers-color-scheme: dark)` unless the site is already dark.

## US audience requirements

### Locale signals (tell Google this is a US site)
- `<html lang="en-US">` on every page.
- `<meta property="og:locale" content="en_US">` and `<link rel="alternate" hreflang="en-us" href="...">` plus a self-referencing `x-default`.
- JSON-LD: `"inLanguage": "en-US"`, Organization with a `PostalAddress` where `addressCountry` is `"US"` and a real state abbreviation, and `"areaServed": "US"`.
- Target US search phrasing in titles and headings — how Americans actually search, not British equivalents.

### Language — this matters more than it sounds
- American spelling throughout: color, favorite, program, practice (both noun and verb), analyze, fulfill, toward (no trailing S).
- Do NOT inherit British spellings if you read any reference site: stabiliser → stabilizer, centring → centering, mobilise → mobilize, realise → realize, metre → meter, practise → practice.
- American medical and fitness vocabulary: physical therapist or PT (never physiotherapist), doctor / physician / provider (never GP), OB-GYN (never obstetrician-gynaecologist), drugstore (never chemist), ER (never A&E), acetaminophen (never paracetamol).
- American everyday vocabulary: fall (not autumn), sneakers (not trainers), restroom (not toilet), vacation (not holiday), math (not maths), gotten is fine.

### Formats and units
- Imperial only: lbs, inches, feet, miles, °F, cups. Never kg, cm, km, °C.
- Dates as `mm/dd/yyyy` or spelled out ("March 4, 2026"). Times as 12-hour with AM/PM. Reference Eastern Time if a time zone is ever needed.
- US phone format `(555) 123-4567` with `<a href="tel:+15551234567">` so iOS dials correctly.
- US mailing address in the footer with a real state abbreviation and ZIP.
- Any printable PDF or print stylesheet must be US Letter, 8.5 × 11 in — never A4. Set `@page { size: letter; }` in the print stylesheet. All five sites offer a printable, so this applies everywhere.

### US legal and regulatory
- Privacy policy covers CCPA/CPRA: right to know, delete, correct, opt out of sale/sharing, non-discrimination, plus the "Do Not Sell or Share My Personal Information" link and Global Privacy Control handling. Write it to cover the broader set of US state privacy laws, not California alone.
- COPPA line: site is not directed at children under 13.
- FTC endorsement rules: testimonials must be presented as individual experience, not typical results. Add a short "Individual results vary" line near the testimonials. If any testimonial were ever incentivized, that must be disclosed.
- FTC health-claim rules: no "treats", "cures", "prevents", "clinically proven", or invented statistics. Describe the practice, not a medical outcome.
- Accessibility statement references ADA Title III and WCAG 2.2 Level AA, with a contact method for accessibility issues.
- Health disclaimer: not medical advice, consult a physician before starting, stop if you feel pain, emergencies call 911.

### Cultural texture (small details that make a site read as genuinely American)
- Testimonials: real-sounding US names with city and state — Naperville IL, Chandler AZ, Cary NC, Spokane WA. Vary the regions, never all coastal.
- Seasonal references use the US calendar where relevant: New Year for the challenge site, Thanksgiving Turkey Trot for the running site, daylight saving shifts for the sleep site.

## Images — real photos only

**Get all images from the internet as real hosted photo URLs. Do NOT use SVG, CSS shapes, gradients, emoji, or generated illustrations in place of a photograph.** Every hero, every pose card, every testimonial avatar, every section image must be an actual photo of a real person or scene, loaded from a live URL.

- Source photos from Unsplash or Pexels, which allow hotlinking and commercial use:
  - Unsplash: `https://images.unsplash.com/photo-{id}?w=1200&q=80&auto=format&fit=crop`
  - Pexels: `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1200`
- **Verify every single URL before you finish.** Do not guess or invent photo IDs — they will 404 and the site ships with broken images. Run `curl -sI "URL" | head -1` on each one, confirm a 200, and replace anything that fails. Search for real photos first, then build the markup around the URLs you confirmed.
- Search terms must match the niche precisely: the prenatal site needs visibly pregnant women, the runners site needs people actually running outdoors, the sleep site needs dim low-light interiors. Generic "woman meditating" stock across all five is exactly what makes a network look mass-produced.
- Never use Google Images results, Getty, Shutterstock previews, or any image whose license you cannot verify. Serving copyrighted photos without permission is an AdSense policy violation and a takedown risk.
- Use the CDN's own resizing params for responsive `srcset` (`?w=400`, `?w=800`, `?w=1600`) rather than a `<picture>` element with local AVIF/WebP files. Set `sizes` accurately so an iPhone downloads the 400w or 800w file, not the 1600w.
- Every image needs explicit `width` and `height` to prevent layout shift, `loading="lazy"` and `decoding="async"` below the fold, and `fetchpriority="high"` on the hero image only.
- Descriptive alt text on every photo — what is actually happening in the image, not the pose name repeated. Decorative images get `alt=""`.
- Add `<link rel="preconnect" href="https://images.unsplash.com">` (or the Pexels equivalent) in the head so the first photo isn't blocked on a cold DNS lookup.
- Note in a README that photos should be downloaded and self-hosted before production launch — hotlinking a third-party CDN is fine for the build but a dependency you don't control.

### The only permitted SVG
SVG is allowed in exactly three places, because these are functional interface elements rather than imagery:
1. The interactive widget where a site prompt explicitly specifies inline SVG (the body-scan figure, the body-map diagram) — these need per-region tap targets and scripted state, which a photo cannot provide.
2. Small UI icons: menu, close, chevron, checkmark. Inline, `currentColor`, 24px.
3. `favicon.svg`.

Everywhere else, use a photo.

## Google publisher policy compliance — build to this, not around it

### Ad labeling (exact wording matters)
- Google permits ONLY two labels on its ad units: "Advertisements" or "Sponsored links". Any other heading — "Advertisement" singular, "Resources", "Helpful links", "Partners", "You may also like" — is a placement violation.
- Use `<aside class="ad-slot" aria-label="Advertisements">` with a visible small-caps "Advertisements" label above the slot.
- The label must not sit close enough to a real content heading that the two blur together. Put at least 32px of space and a hairline rule between the last content element and the ad label.

### Ad placement
- Three slots maximum per content page: after the first content section, mid-page between two sections, and above the footer. Reserve height with `min-height` at every breakpoint so CLS stays at 0.
- Ads must be visually distinguishable from content: different background tint or a border, and never the same card styling used for real content cards.
- Never place an ad in the hero, immediately adjacent to a button or nav element, inside the interactive widget, or anywhere a mis-tap is likely. On a 390px iPhone screen leave 40px of clearance between any ad slot and any tappable control.
- Ads must never push the page's primary content below the fold.
- Do not pair an ad with a specific image or caption — Google treats implied association between an image and an ad as a violation.
- No ads on: 404.html, the legal pages, or any thank-you/confirmation state after the newsletter form submits.
- No sticky/anchor ad in this build. If one is added later it must be dismissible, and only one may be in the viewport at a time.
- No language anywhere on the site that encourages clicks — no "check out our sponsors", no arrows or animation pointing at a slot.
- Ad content must not outnumber or overwhelm publisher content on any page.

### Files and disclosure
- Include an `ads.txt` at the site root with a commented placeholder line and a note to replace the publisher ID before launch.
- Privacy policy must disclose: third-party vendors including Google use cookies to serve ads, Google's use of advertising cookies, and a link to Google's Ads Settings so users can opt out of personalized advertising.
- Cookie policy must name the ad cookies category specifically, not just "we use cookies".

### Consent (this is where most US-focused sites get lazy and later get flagged)
- Build a real consent banner, not a dismiss-only cookie notice. Two equally weighted buttons — Accept and Reject — never a styled Accept next to a grey text link.
- Store the choice in localStorage and expose a persistent "Cookie settings" link in the footer so the choice can be changed.
- Leave a clearly commented integration point where a Google-certified CMP script will go. Even a US-targeted site gets EEA/UK/Swiss traffic, and Google requires a certified CMP with TCF v2.3 consent strings for those users.
- Include a footer link "Do Not Sell or Share My Personal Information" wired to the same consent state, and honor the Global Privacy Control browser signal in JS if present. US state privacy laws now cover well beyond California.

### Valuable inventory / content quality (the top rejection reason)
- The site must not read as built-for-ads. Real depth, a clear stated audience, and consistent niche focus on every page.
- Health topics are YMYL, so E-E-A-T signals are required: a named author with a stated background on every content page, a visible "Last reviewed" date, an About page that says who is behind the site and why, and a real Contact page with a working form and a US mailing address.
- Cite sources for any factual health claim, linking to reputable sources (Mayo Clinic, NIH, ACOG, AAOS). Never invent a study or a statistic.
- Working navigation, no broken links, no placeholder or under-construction pages, HTTPS assumed.

## SEO
- Unique title (under 60 chars) and meta description (under 155) per page.
- Open Graph + Twitter card tags, canonical URL, `robots` meta.
- JSON-LD on every page: Organization + WebSite on index; FAQPage on the FAQ section; HowTo on the steps section; BreadcrumbList sitewide; Article on content pages.
- Semantic landmarks: one `<h1>` per page, ordered headings, `<nav>`, `<main id="main">`, `<footer>`, skip-to-content link.
- sitemap.xml listing all pages, robots.txt pointing to it.

## Accessibility floor
- 4.5:1 contrast for body text, 3:1 for large text and UI borders. Check every combination.
- Visible keyboard focus ring on everything interactive — never `outline: none` without a replacement.
- Correct ARIA on the mobile menu (`aria-expanded`, `aria-controls`), FAQ accordion (`<details>` or button+`aria-expanded`), and the interactive widget (`aria-live` for changing text).
- Form labels are real `<label>` elements, errors announced, never placeholder-as-label.

## Design discipline
Before writing code, write a short design plan in DESIGN.md: 5 named hex colors, the two typefaces and their roles, an ASCII wireframe of the hero and one content section, and 3 principles unique to this brand. Then check the plan against these known generic tells and revise anything that matches:
- cream #F4F1EA background + high-contrast serif + terracotta accent
- identical rounded cards with identical soft grey shadows for every section
- all-caps tracked-out eyebrow labels above every heading
- "→" appended to button text; meta strings joined with middle dots
- fade-and-slide-up entrance animation on every section
Spend your boldness in one place per site. Everything else stays quiet.

## Content rules
- Write all copy yourself, original to this brand. Do not reuse sentences between sites.
- No fake credentials, no invented studies, no medical claims ("cures", "treats", "reduces cortisol by 40%"). Say what the practice feels like and what people report, not what it clinically does.
- 1,200+ words of genuine, specific body copy on index.html and each content page. Depth beats length — a reviewer can tell padding from substance, and "low value content" is the most common rejection.
- Every content page carries an author byline, a one-line author background, and a "Last reviewed" date.
- Write from experience, with concrete specifics: exact hold times, what a pose actually feels like, common mistakes, what to do when it doesn't work. Generic wellness prose reads as machine-made and gets rejected.