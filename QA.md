# Verification — 20 October 2026

## Architecture

Static HTML/CSS/native JavaScript modules on GitHub Pages. There is no application backend, database, account system or upload API. All photo processing runs in the browser. The CSP declares `connect-src 'none'`.

## Fixed issues

1. Clearing a photo hid but did not erase the mini-preview canvas. Clear now releases that buffer, other previews, selected-file references and object URLs.
2. Clearing a numeric landmark retained the old measurement and allowed fitting. It now removes the landmark and disables fitting until replaced.
3. A zero or negative file-size ceiling silently acted as unlimited. Invalid nonempty ceilings now disable export with a validation message.
4. The final guided-marking instruction was immediately overwritten by a redraw. It now remains visible with the next action.
5. The reset-framing message was also immediately overwritten. It now survives rendering.

Rejected replacement files also explicitly explain when the previous valid photo remains selected.

## Automated checks

16 passing tests in `tests/*.test.mjs`, plus module syntax and Git whitespace checks. Geometry cases cover every profile, portrait/landscape/square originals, boundary pan, zoom and rotation. Application-state tests cover asynchronous decode replacement/clear races, original Blob preservation, preview cleanup, rapid export replacement, transparent/corrupt/unsupported input and the five repaired behaviours. The application-state harness models DOM and canvas APIs; it does not replace browser rendering tests.

## Actual browser checks

The Codex in-app browser was used with non-personal test images to verify transparent PNG, corrupt JPEG and unsupported-file rejection; numeric marker deletion; invalid file-ceiling export blocking; valid fitting; JPEG encoding/download; clearing; and absence of console errors. The downloaded JPEG was checked with macOS image metadata tools. Earlier release checks additionally verified the seven-country selector, all adjustment controls, full-size viewer, JSON report, a byte-identical UK original download, and no horizontal overflow at a 390-pixel viewport.

No personal photos or test images are published. Government checkers were not given any photos during testing. Official photo acceptance is separate from application correctness.

## Limits

This is not an exhaustive proof of no bugs. Safari, Firefox, physical mobile devices and every possible image/EXIF encoding were not directly tested. Source photo quality, photographic requirements and government acceptance cannot be guaranteed by geometry checks.
