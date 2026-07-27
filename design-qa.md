# Mobile Home Design QA

## Comparison target

- Source visual truth path: user-provided conversation attachment, `852 × 960` pixels (the host did not expose a local attachment path).
- Ratio feedback evidence: user-provided conversation attachment, `557 × 863` pixels.
- Final implementation screenshot: `qa-home-852x960-ratio-pass1.png`.
- Additional responsive screenshots: `qa-home-557x863-ratio-pass2.png` and `qa-home-390x844-ratio-pass1.png`.
- Desktop regression screenshot: `qa-home-1440x1000-pass2.png`.
- Viewport: source and primary implementation both `852 × 960`; implementation CSS viewport `852 × 960`; `deviceScaleFactor: 1`.
- State: home route, mobile navigation closed, no authentication required.
- Comparison input: the source attachment and final implementation screenshot were reviewed together in the current multimodal thread at matching pixel dimensions.

## Full-view comparison evidence

- The header is `114px` tall at the primary viewport, matching the source region proportion.
- The three action cards measure `684 × 126px` and sit at `x=84`, with top positions `508.3`, `650.0`, and `791.8px`. This stays within `8px` of the source placement while preserving the exact source width, height, and gaps.
- The hero keeps the source hierarchy: two colored consultation lines, a separate 30-second CTA line, supporting copy, then three high-contrast actions over the consultation photograph.
- The generated photograph preserves the source composition and art direction: bright neutral office, attorney on the right, client hands at lower left, legal desk props at lower right, and quiet negative space behind the headline.
- The user-reported `557 × 863` viewport now scales directly from the source: cards are `447.3 × 82.4px`, start at `x=54.9`, and use top positions `345.7`, `438.4`, and `531.1px`.
- The `390 × 844` capture has `body.scrollWidth === body.clientWidth === 390`; all cards remain fully inside the viewport at `x=38.4`, `width=313.2`, `right=351.6`.
- The `1440 × 1000` capture confirms that the pre-existing desktop hero remains unchanged.

## Focused region comparison evidence

- Header: the final hamburger is a three-line Phosphor icon and measures `44 × 44px`, positioned at `x=768`, `right=812` in the `852px` viewport. The logo lockup and English caption use the source's left alignment and expanded tracking.
- Hero type: Pretendard is retained for Korean optical weight and wrapping. The headline left edge is aligned to the source at approximately `70px` in the primary viewport.
- Actions: all icons use one library and consistent stroke treatment. Text, icons, and carets remain vertically centered, with source-like radii and restrained multi-layer elevation.
- A separate crop was not needed because the `852 × 960` full-view capture renders the header text and action copy sharply enough for direct inspection.

## Required fidelity surfaces

- Fonts and typography: passed. Pretendard Variable is loaded, weights and hierarchy match, all source copy is present, and no truncation or unintended wrapping appears at either tested width.
- Spacing and layout rhythm: passed. Cards use the source's `80.3%` viewport-width ratio, hero height is capped to the source's `99.3%` width ratio, the header action is correctly right-aligned, and all tested phone viewports have no horizontal overflow.
- Colors and visual tokens: passed. Warm off-white, legal navy, finance green, and blue-black are defined as project tokens. White contrast is `10.96:1`, `5.37:1`, and `16.28:1` respectively.
- Image quality and asset fidelity: passed. The custom hero photo is a sharp `1122 × 1402` source encoded as a `68KB` WebP, with no embedded text, logo, watermark, or visible compression issue.
- Copy and content: passed. The three CTA titles and support lines follow the supplied reference and link to the appropriate existing product routes.
- Icons: passed. Phosphor icons replace ad hoc approximations for the new hero and mobile menu.
- Behavior and accessibility: passed. Tap targets exceed `44px`, visible focus treatment is present, reduced-motion behavior is inherited, the mobile menu opens, and all three destination routes return HTTP `200`.

## Comparison history

### Iteration 1

- Evidence: `qa-home-852x960-pass1.png`.
- [P1] The hamburger was auto-placed in the second grid column instead of the right edge.
- [P2] The headline began too close to the left edge compared with the source.
- [P2] Action titles were optically undersized at the primary viewport.
- Fixes: assigned the menu toggle to grid column 3, added the source-aligned headline inset, increased responsive title sizing, and switched the menu to a three-line library icon.

### Final iteration

- Evidence: `qa-home-852x960-pass3.png` and `qa-home-390x844-pass3.png`.
- Post-fix result: the header control is at the expected right edge, source-region spacing is restored, action hierarchy is stronger, and no P0/P1/P2 issue remains.

### Ratio feedback iteration

- Evidence before fix: `qa-home-557x863-ratio-pass0.png` and the user's `557 × 863` attachment.
- [P1] The hero used viewport height and `space-between`, pushing the first card to `y=572.8` instead of maintaining the source's width-scaled vertical rhythm.
- [P2] Cards measured `509px`, or `91.4%` of the viewport, instead of the source's `80.3%` proportion.
- Fixes: replaced full-height distribution with a `99.3vw` hero cap, changed the content flow to `flex-start`, set the source-derived `8.3vw` copy-to-action gap, and changed card width to `80.3vw`.
- Post-fix evidence: `qa-home-557x863-ratio-pass2.png`, `qa-home-852x960-ratio-pass1.png`, and `qa-home-390x844-ratio-pass1.png`.
- Post-fix result: at the reported viewport, the first card moved from `y=572.8` to `y=345.7`, card width changed from `509px` to `447.3px`, and the hero now ends immediately after the card stack like the source. No actionable P0/P1/P2 issue remains.

## Interaction and runtime checks

- Mobile menu: `aria-expanded="true"` after activation; drawer rendered.
- CTA routes: `/inquiry`, `/inquiry/money`, and `/chat` each returned HTTP `200`.
- Browser console: `0` page console errors during the final Chrome CDP capture.
- Production build: Next.js compile, lint, type check, and static generation passed.

## Follow-up polish

- [P3] The reference uses slightly more luminous button fills and a money-bag metaphor. The implementation intentionally uses flatter, calmer brand fills and the closest coherent Phosphor finance icon to match the requested restrained mood.

## Final result

final result: passed
