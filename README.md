# Photo Guide

A private, browser-based visa and passport photo workspace. **No AI image editing, retouching, background replacement, padding or server-side photo uploads.**

Live site: https://nipuna-lakruwan.github.io/visa-photo-guide/

## Features

- Country + exact application profiles for Malaysia (VDR/VTR ESD), US visa, India e-Visa, UK digital passport, Australian passport print, Irish visa print, and Canadian passport print reference.
- Government-source summaries and direct official checker, crop-tool or application links. No invented public verification links.
- Illustrated, sequential head/chin/face-centre marking; draggable dots and accessible numeric fields.
- Real-time zoom, position and straightening; drag the crop or use arrow keys (Shift for a larger movement).
- Every transformed crop remains inside the original. No blank margins are filled.
- Actual JPEG compression preview, adjustable pixel dimensions and file ceiling, full-size inspection, settings/measurement report.
- UK digital and Canadian passport profiles preserve the original file bytes on download. Crop previews in those modes are references only.
- Responsive layout, no third-party libraries, fonts, analytics, storage or API keys.

## Use

1. Choose the country and document type. Read the official rules.
2. Choose a recent original studio photo as required by that application (JPEG, opaque PNG or opaque WebP).
3. Use **Help me mark** and follow the illustrated prompts. Drag any marker to correct it.
4. Fit the crop; review measurements and adjust the controls. A crop cannot fix an inappropriate source, missing shoulders, blur, pose or the wrong background.
5. Inspect the actual export, download, and visit the official application/checker yourself.

Green geometry indicators are **not approval**. Photo recency, expression, background, photographer, paper and application requirements still apply. The government authority makes the final decision.

Country rules were reviewed on **20 October 2026**. Profiles are adult reference guides; children, disabilities and exemptions may differ. Always follow the latest official page and actual upload instructions.

## Local development

This app uses native JavaScript modules. Serve it over HTTP rather than opening `index.html` through `file://`:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open http://127.0.0.1:8766 . No build or dependency installation is required.

```sh
node --test tests/geometry.test.mjs
node --check app.mjs
```

Tests cover crop boundaries across all profiles, rotations and aspect ratios, coordinate round trips, feasible/infeasible fitting, and original-preserving profile declarations. UI checks additionally cover upload, live controls, country changes, impossible file ceilings, JPEG downloads, byte-identical original downloads, and mobile overflow.

## Privacy and hosting

Only application source files are published. No personal or test photos are bundled. Chosen photos stay in browser memory; clearing or reloading removes them from the app. Exported files are downloaded to the user's device. The report includes manually placed landmark coordinates but no image data. External government websites have separate privacy policies; the user chooses whether to upload there. GitHub Pages receives ordinary site requests, never the chosen image through this app.

The Content Security Policy blocks network connections from application JavaScript (`connect-src 'none'`). This is a static site with no backend. Source profiles are in `profiles.mjs`; geometry is in `geometry.mjs`.
