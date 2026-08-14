# Best Lawyers Enhanced Profile Landing Page — V2

This V2 takes the recognizable visual grammar of BestLawyers.com and rebuilds it as a more modern, conversion-focused scroll experience. It retains the approved landing-page copy and supplied Best Lawyers assets.

## Project files

- `index.html` — semantic page structure and approved copy
- `styles.css` — brand system, responsive layout and all visual treatments
- `script.js` — scroll-linked scenes, active navigation, reveal behavior, carousel controls and analytics hooks
- `assets/` — supplied Best Lawyers logo, favicon and approved profile/listing imagery
- `setup-fonts.sh` — installs the approved Optima and Gentleman font files from the original supplied ZIP

No framework, package manager, build step or third-party animation library is required.

## Run locally

1. Install the approved fonts:

   ```bash
   ./setup-fonts.sh "/path/to/Best Lawyers - Buy Side Fonts(2).zip"
   ```

2. Start a local server:

   ```bash
   python3 -m http.server 8080
   ```

3. Open `http://localhost:8080`.

Opening `index.html` directly also works, but a local server is better for browser QA.

## In-page navigation

- `#why-upgrade`
- `#compare`
- `#enhanced-profile`
- `#benefits`
- `#results`
- `#activate`

## Scroll behavior

Desktop includes:

- a reverse-gravity distribution interlude
- a pinned search-placement and visibility sequence
- opposing-direction Free vs Enhanced comparison entrance
- a listing-to-full-profile product story
- a horizontal benefit rail
- active section tracking in the navigation

Mobile and reduced-motion users receive a fully readable linear version with no pinned-scroll dependency.

## Analytics hooks

CTA clicks dispatch:

```js
window.addEventListener("blpe:cta", (event) => {
  console.log(event.detail.placement);
});
```

The available placement values are `header`, `profile-story` and `final`.

## Production handoff

1. Replace the `#activate` destinations with the approved SSO/store or campaign URL.
2. Confirm final external navigation routes.
3. Connect `blpe:cta` to the production analytics taxonomy.
4. Run accessibility, browser, mobile and performance QA in the deployment environment.
5. Keep the approved-copy requirement in place during any future content edits.
