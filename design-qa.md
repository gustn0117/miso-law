# Responsive Consultation Hero Design QA

## Comparison target

- Source visual truth: the user-provided mobile reference in the conversation, represented by the previously approved `qa-home-852x960-ratio-pass1.png`, plus the approved mobile hero asset `public/images/hero-consultation-mobile-v1.webp`.
- Desktop image source: `public/images/hero-consultation-desktop-v1.webp`, generated from the approved mobile hero photograph as a wide responsive extension.
- Final implementation screenshots:
  - `qa-home-1440x1000-desktop-hero-pass2.png`
  - `qa-home-1024x900-desktop-hero-pass1.png`
  - `qa-home-1920x1080-desktop-hero-pass1.png`
  - `qa-home-852x960-desktop-hero-regression.png`
- Combined visual comparison input: `qa-home-responsive-hero-comparison.png`.
- Route and state: `/`, signed-out header, navigation closed, three consultation actions visible.
- Density: all browser captures use `deviceScaleFactor: 1`.

## Viewport and normalization

- Mobile source and implementation: `852 × 960` source pixels and `852 × 960` implementation pixels at an `852 × 960` CSS viewport. The combined comparison scales both equally to `720px` wide without changing their relative density.
- Primary desktop implementation: `1440 × 1000` pixels at a `1440 × 1000` CSS viewport.
- Additional desktop resilience checks: `1024 × 900` and `1920 × 1080` CSS pixels.
- The desktop view is an intentional responsive adaptation rather than a pixel-identical desktop mock: copy and the vertical action hierarchy are preserved on the left while the consultation subject occupies the right.

## Full-view comparison evidence

- The approved mobile layout is unchanged: at `852px`, the three cards remain `684 × 126px` at `x=84`, with top positions `508.3`, `650.0`, and `791.8px`.
- At `1440px`, the hero occupies `749px` below the `80px` header. The three cards are `540 × 94px`, aligned at `x=103.7`, with consistent `12px` gaps.
- At `1024px`, the cards remain fully readable at `419.8 × 94px`; the headline, description, and actions do not collide with the attorney or the next section.
- At `1920px`, content stays inside the existing `1440px` site container while the background image continues to fill the viewport without stretching or visible seams.
- All four tested widths have `body.scrollWidth === body.clientWidth`; no horizontal overflow is present.

## Focused region comparison evidence

- Typography: the two colored consultation phrases preserve the mobile source hierarchy and Pretendard optical weight. Desktop line breaks remain deliberate and no text truncates.
- Imagery: the wide asset keeps the same attorney, navy suit, warm office, writing hand, clipboard, client hands, gavel, and books while adding clean negative space for live UI copy.
- Actions: all three cards keep the same legal navy, finance green, and diagnosis blue-black tokens, Phosphor icon family, white carets, rounded corners, and hierarchy from the mobile source.
- A separate crop was not required because the combined comparison renders the header, hero type, card copy, icons, and image crop sharply enough for direct inspection.

## Required fidelity surfaces

- Fonts and typography: passed. Pretendard Variable, `800` headline weight, restrained negative tracking, line height, wrapping, and supporting-copy hierarchy remain coherent from `1024px` through `1920px`.
- Spacing and layout rhythm: passed. Desktop uses a stable left content column, consistent `12px` action gaps, `20px` radii, and container-aligned horizontal margins. Mobile measurements remain unchanged.
- Colors and visual tokens: passed. Existing `--c-legal`, `--c-finance`, and `--c-diagnosis` values are reused without introducing a competing palette.
- Image quality and asset fidelity: passed. The desktop hero is a sharp `1672 × 941` source encoded as a `70KB` WebP, with no text, logos, watermarks, visible seams, duplicated hands, or malformed legal props.
- Copy and content: passed. The mobile copy and all three destination labels remain unchanged and link to the existing product routes.
- Icons and surfaces: passed. Phosphor icons remain aligned and consistent at desktop sizes; no placeholder, custom SVG, CSS drawing, or text-glyph substitute was introduced.
- Responsiveness and accessibility: passed. No overflow or overlap appears at the tested breakpoints, focus styles remain available, cards are keyboard links, and all CTA routes return HTTP `200`.

## Findings

- No actionable P0, P1, or P2 differences remain.

## Comparison history

### Desktop pass 1

- Evidence: `qa-home-1440x1000-desktop-hero-pass1.png`.
- Visual result: the first full desktop render preserved the mobile hierarchy and produced no P0/P1/P2 design finding.
- Runtime finding: the browser reported a missing default favicon request. This did not affect the hero visual but was corrected by declaring the existing trust icon in site metadata.

### Final pass

- Evidence: `qa-home-1440x1000-desktop-hero-pass2.png`, `qa-home-1024x900-desktop-hero-pass1.png`, `qa-home-1920x1080-desktop-hero-pass1.png`, and `qa-home-852x960-desktop-hero-regression.png`.
- Post-fix result: browser console errors are `0`, all three CTA routes return `200`, desktop layout remains stable across the tested range, and the mobile source composition is unchanged.

## Interaction and runtime checks

- CTA routes: `/inquiry`, `/inquiry/money`, and `/chat` each returned HTTP `200`.
- Browser console: `0` errors in the final desktop captures.
- Production build: Next.js compilation, linting, type checking, page generation, and build tracing passed.

## Follow-up polish

- No blocking follow-up remains. A future brand pass could provide a dedicated square favicon, but the current existing trust icon is functional and does not affect the hero.

## Final result

final result: passed
