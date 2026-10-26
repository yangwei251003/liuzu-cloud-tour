> 历史开发记录（2026-08）。本次公开副本已排除权利未确认素材、私有配置和原型截图；当前功能/验证以根 README、CHANGELOG、THIRD_PARTY_NOTICES 为准。历史文件名仅用于来源追溯，不代表对应媒体已随仓库公开。

# Design QA

final result: blocked

Strict pixel-fidelity result: FAILED. The required ≤1% visual-difference threshold is not met.

## Comparison target

- Source visual truth: `references/prototypes/`（P01–P32）。
- Implementation: production previews at `http://127.0.0.1:4173/` and `http://127.0.0.1:4174/admin/`.
- Browser: system Google Chrome through Playwright 1.62.1.
- Primary comparison viewport: 1487×1058 CSS px, deviceScaleFactor 1; source and implementation normalized to 1487×1058 pixels.
- State: public pages use default/offline/no-model state; admin P27 uses logged-out state, P28–P32 use local demo authenticated state.

## Evidence

Full-view combined evidence is stored in `output/playwright/comparisons/` for P01, P05, P06, P09, P17, P19 and P27–P32. Each file places the reference on the left and the same-size implementation on the right in one 2974×1098 image. Focused inspection was performed on navigation/hero, map disclosure, 3D failure panel, stamp medallions, admin tables/forms and mobile navigation. Separate focused crops were unnecessary because those regions remain legible in the original-size combined images.

Responsive implementation evidence is stored in `output/playwright/screenshots/` for 1440×1024, 768×1024, 390×844 and 1920×1080. Primary interactions tested: navigation, spot filtering, gallery open/close and focus-managed dialog, offline map disclosure, unavailable 3D disclosure, admin validation/login/navigation. Browser console and route rendering were checked during production smoke; no blocking runtime error remained.

## Findings

- [P1] Strict pixel fidelity is not achieved. Measured full-frame mismatch is 52.4% for P01, 65.1% for P06 and 92.2% for P09, all far above the required ≤1% threshold. These figures are image-difference coverage measurements and are not softened by functional correctness.
- [P1] Only 12 of 32 prototype frames have same-size combined comparison evidence. The other 20 frames have route/function mapping but no direct visual pair, so full-site pixel acceptance is incomplete.
- [P2] Approved Noto/Geist font files are not bundled; system fallback changes glyph metrics and prevents pixel-level typography acceptance.
- P05 intentionally omits apparently precise geographic Marker/route geometry because coordinates are unverified; the implementation clearly labels the AI offline map as non-navigation imagery.
- P09 intentionally does not reproduce the reference's rendered 3D scene because no licensed model was supplied; the implementation exposes controls and a clear unavailable/planning state.
- P17 uses original AI demonstration medallions and explicitly states that they are not official seals.

## Required fidelity surfaces

- Fonts and typography: serif display/sans body hierarchy, weights, line heights and wrapping are stable; system fallback is documented.
- Spacing and layout rhythm: 8px rhythm, consistent containers, radii and card density; five viewport checks pass without persistent control clipping.
- Colors and tokens: shared paper/green/gold/vermilion tokens preserve the source hierarchy and meet semantic contrast through accompanying text.
- Image quality and assets: optimized AVIF/WebP/PNG source sets, correct crop behavior and visible AI disclosure; no whole-page screenshot, custom SVG, CSS/div art or emoji replaces source imagery/icons.
- Copy and content: source page hierarchy is retained; unverified facts and unavailable integrations are not presented as confirmed.

## Comparison history

1. Initial automated responsive pass found a P2 mobile-admin horizontal overflow of 136px at 390×844. The sidebar/navigation received explicit min/max-width containment and scroll ownership.
2. Post-fix production build and Playwright run passed 22/22 functional/media/responsive cases; the 390px document overflow measured at most 1px.
3. Revised same-size captures were combined with references and re-opened for visual inspection. Functional/responsive QA passed, but strict visual QA remains blocked by the measured differences, missing 20 visual pairs, unbundled fonts, and unavailable real map/model assets.

## Follow-up polish

- Bundle the approved display/body fonts after licensing.
- Replace AI scene imagery and fallback states when project-owned photos, coordinates and models arrive.
- Capture and measure the remaining 20 prototype pairs, then iterate every P1/P2 mismatch to ≤1%.

## Implementation checklist

- [x] Same-size source and implementation combined before judgment.
- [x] Five responsive viewports inspected.
- [x] Core controls and degraded states exercised in Chrome.
- [ ] Strict visual difference ≤1%.
- [ ] All 32 prototype frames captured as same-size visual pairs.
- [ ] Approved fonts and missing formal assets supplied.
