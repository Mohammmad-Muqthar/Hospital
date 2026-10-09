# Trionix Hospital CRM — marketing homepage

A cinematic, scroll-choreographed homepage for Trionix Hospital CRM, built with
**React 19 + Vite 8**, **GSAP 3 + ScrollTrigger** (via `@gsap/react`), **Motion**
(`motion/react`, formerly Framer Motion) and **Lucide** icons, set in **Sora**
(display) and **DM Sans** (body).

Page order: Navbar → Hero → Features → How it works → Roles → Secure by design →
Pricing → Footer.

---

## 1. Requirements and installation

- Node.js **20.19+ or 22.12+** (Vite 8 requirement) and npm 10+.

```bash
npm install        # installs everything listed in package.json
npm run dev        # local dev server (http://localhost:5173)
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

### Packages this project uses

If you are adding the homepage to another React + Vite project, these are the
runtime packages it needs:

```bash
npm install gsap @gsap/react motion lucide-react @fontsource-variable/sora @fontsource-variable/dm-sans
```

| Package | Used for |
| --- | --- |
| `gsap` (+ ScrollTrigger, bundled) | all scroll choreography, pinning, 3D transforms |
| `@gsap/react` | `useGSAP()` — scoped, StrictMode-safe GSAP setup and automatic cleanup |
| `motion` | hover / tap micro-interactions, tab and currency indicators, mobile menu (`import … from 'motion/react'`) |
| `lucide-react` | icons |
| `@fontsource-variable/sora`, `@fontsource-variable/dm-sans` | self-hosted variable fonts (no Google Fonts request) |

No smooth-scroll library is used on purpose: native scrolling plus ScrollTrigger
`scrub` smoothing is the most stable option across devices.

---

## 2. Assets

| Asset | Location | Status |
| --- | --- | --- |
| Hero background video | `public/videos/hero1.mp4` (H.264, 1280×720, 6 s loop, 1.9 MB) | **Included.** A 1920×1080 export would look crisper on large desktop screens. Optionally add a `.webm` and a poster image (see §3). |
| Official Trionix Hospital logo (transparent PNG/SVG, white wordmark for dark backgrounds) | `public/images/trionix-hospital-logo.png` | **Still needed.** Until it is added, a plain "Trionix Hospital" text label is shown (the logo is never redrawn in code). |

If the video file is missing or fails to load, the hero falls back to a still
deep-forest cinematic background automatically. Paths can be changed without
code via a `.env.local` file (see below).

--- | --- | --- |
| Official Trionix Hospital logo (transparent PNG/SVG, white wordmark for dark backgrounds) | `public/images/trionix-hospital-logo.png` | plain "Trionix Hospital" text label (the logo is never redrawn in code) |
| Hero background video | `public/videos/hero.mp4` (optional `hero.webm`, poster image) | a still deep-forest cinematic background |

Paths can also be changed without code via a `.env.local` file (see below).

---

## 3. Configuration (`src/config/site.js`)

Every external destination and asset path lives in one file and can be
overridden with Vite env variables:

```bash
# .env.local
VITE_LOGO_SRC=/images/trionix-hospital-logo.png
VITE_HERO_VIDEO_SRC=/videos/hero1.mp4
VITE_HERO_VIDEO_WEBM=/videos/hero.webm
VITE_HERO_POSTER_SRC=/images/hero-poster.jpg
VITE_TRIAL_URL=https://app.example.com/signup      # "Start trial" buttons   (default /signup)
VITE_SIGNIN_URL=https://app.example.com/login      # "Sign in"               (default /login)
VITE_SUPPORT_URL=https://app.example.com/support   # "Support"               (default /support)
VITE_FULL_PRICING_URL=/pricing                     # "See full pricing"      (default /pricing)
```

If the host application has a router, pass handlers instead of (or as well as)
URLs — each receives the click event and may call `event.preventDefault()`:

```jsx
<App actions={{ onTrial: (e) => { e.preventDefault(); navigate('/signup') }, onSignIn, onSupport, onPricing, onFullPricing }} />
```

---

## 4. Where things live

```text
src/
├── main.jsx                      fonts + global styles + <App/>
├── App.jsx                       Navbar · <main><HomePage/></main> · Footer
├── config/site.js                destinations, asset paths, section ids
├── context/                      SiteActions (optional host-app click handlers)
├── styles/
│   ├── variables.css             design tokens (colours, type scale, radii, shadows, easing)
│   ├── typography.css            .t-display / .t-h2 / .t-lead / .t-eyebrow …
│   └── globals.css               reset, focus styles, utilities
├── lib/
│   ├── gsap.js                   the ONLY place GSAP/ScrollTrigger are imported and registered
│   ├── sharedMediaQueries.js     de-duplicates MediaQueryLists (see §6)
│   ├── motion.js                 shared Motion springs / easings
│   └── scroll.js                 pinned-section-aware scrollToSection / scrollToTimelineLabel
├── hooks/
│   ├── useScrollTriggerSetup.js  page-level refresh, scroll anchor, reload restore
│   ├── useSiteLink.js            { href, onClick } for any destination key
│   ├── useMediaQuery.js, usePrefersReducedMotion.js
├── components/
│   ├── Navbar/                   global navbar (desktop grid + mobile dialog menu)
│   ├── Footer/                   global footer
│   └── ui/                       Button, BrandLogo, Icon
├── data/
│   ├── siteContent.js            ALL approved marketing copy (edit text here)
│   ├── pricingData.js            plans, prices, currencies, per-day maths
│   └── mock/                     illustrative data shown inside product mock-ups
└── pages/HomePage/
    ├── HomePage.jsx              section order
    └── components/
        ├── Hero/                 video → zoom-through headline → 3D dashboard → four-card split
        ├── Features/             three-scene 3D product showcase (12 features)
        ├── HowItWorks/           3D phone with four scroll-driven notifications
        ├── Roles/                one CRM workspace that transforms per role
        ├── Security/             CSS-3D security architecture in four states
        └── Pricing/              plans, USD/QAR switcher, cost insight
```

### Updating content
- **Copy:** `src/data/siteContent.js` (navbar labels, hero, features, steps, roles,
  security, footer). Components read from it; never hard-code copy in JSX.
- **Pricing:** `src/data/pricingData.js` — USD prices, seats, platforms, wording.
  **QAR:** the original project's QAR source was not available, so QAR is derived
  from USD with the official fixed peg (1 USD = 3.64 QAR). To use exact QAR list
  prices, set `prices.QAR` on each plan; those values are then shown verbatim.
- **Mock data:** `src/data/mock/*.js` — every number inside the dashboard, phone,
  workspace and architecture mock-ups. It is deterministic sample data and is
  labelled "Sample data" in the UI wherever it could read as real results.

### Navbar ↔ sections
Navbar and footer links use destination keys (`features`, `howItWorks`, `roles`,
`pricing`, `trial`, `signIn`, `support`) resolved by `useSiteLink`. In-page links
smooth-scroll with `lib/scroll.js`, which knows where each pinned section really
starts. Section ids are defined in `SECTION_IDS` in `src/config/site.js`; the
anchor id sits on the pinned `<section>` element.

---

## 5. How the animation is organised

- Each section builds its choreography in a hook or module next to it
  (`heroTimeline.js`, `useFeaturesChoreography.js`, `useHowItWorksChoreography.js`,
  `useRolesScene.js`, `securityTimeline.js`) inside `useGSAP()` + `gsap.matchMedia()`:
  one branch per breakpoint, plus a reduced-motion branch with no pinning.
- Pinned sections use **one master timeline** each (`pin`, `scrub`, timeline labels for
  states). Total pin length on desktop is about 3–3.8 viewport heights per section.
- **GSAP owns scroll-driven transforms; Motion owns hover/tap/state micro-interactions**,
  always on different elements, so they never fight over the same property.
- React state is never updated per frame; scroll-driven state (active step / role)
  changes only when its index changes.
- `prefers-reduced-motion: reduce` gets complete static compositions (no pins, nothing hidden).

---

## 6. Scroll robustness rules (read before adding a section)

1. Import GSAP only from `src/lib/gsap.js`.
2. Inside a `gsap.matchMedia()` branch, **never** create a bare
   `ScrollTrigger.create({...})` or a trigger on a single tween. Attach triggers to a
   timeline (`gsap.timeline({ scrollTrigger })`, an empty timeline is fine for
   callbacks). Bare triggers refresh immediately and wipe GSAP's remembered scroll
   position, which jumps the page to the top on rotation / breakpoint changes.
3. Don't add per-section scroll memory: `useScrollTriggerSetup` keeps a page-level
   anchor (section + progress) and re-seats the reader after every refresh and reload.
4. Never put transforms, filters or `overflow` on ancestors of a pinned section.
5. `lib/sharedMediaQueries.js` makes identical media queries share one
   `MediaQueryList` so a breakpoint crossing triggers one ScrollTrigger refresh.
6. Use `ANTICIPATE_PIN` from `src/lib/gsap.js` for `anticipatePin` on every pinned
   trigger (0.3 — larger values pin sections early on PageDown / scrollbar drags).

---

## 7. Design decisions worth knowing

- **Hero video has no pause button.** The brief asked for the play/pause control to be
  removed. The video never autoplays for visitors with *reduce motion* enabled, and it
  pauses whenever the hero is off screen. WCAG 2.2.2 asks for a pause control on
  moving content longer than 5 seconds; if you need strict WCAG 2.2 AA conformance,
  add a small pause toggle back to `HeroBackground.jsx`.
- **Pin lengths:** Hero ≈ 3.1, Features 3.8, How it works ≈ 3.2, Roles ≈ 3.15 and
  Security 2.8 viewport heights on desktop; phones pin only the Hero and How it works,
  and only for short distances. Short or narrow screens get composed, non-pinned
  layouts instead of cramped pinned ones.
- **Mock data is illustrative** and labelled "Sample data" where it could be read as
  real results; all mock money is in USD.

---

## 8. Browser support

Current evergreen browsers (Chrome/Edge, Safari 16+, Firefox). The layouts use
CSS container queries, `color-mix()`, `overflow: clip` and `svh` units.
