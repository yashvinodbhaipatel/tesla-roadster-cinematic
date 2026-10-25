# Roadster — Beyond Gravity

An independent cinematic Roadster concept by Yash Patel. A buildless website with an exact exterior reference viewer and a separate original Three.js motion prototype.

![Roadster — Beyond Gravity preview](./preview.jpg)

See [all updates](./CHANGELOG.md).

## Run

Serve `dist/` over HTTP, for example `python3 -m http.server 4173 --directory dist`.

## Exact reference exterior

The landing page displays [Tesla Roadster 3D by The3DBoss](https://sketchfab.com/3d-models/tesla-roadster-3d-559b4fe0bf8342f3ae25370ffaa40d0a) using its official Sketchfab embed. It is the exact exterior linked in the design brief, including the angular body, glass canopy, aero wheels and rear light bar. Drag to orbit; scroll or pinch to zoom. An internet connection to Sketchfab is required.

The model belongs to The3DBoss. No mesh or texture data is copied or distributed in this repository. The creator links a paid asset on [Fab](https://www.fab.com/listings/a9edaf96-14e3-4e11-bbb3-7b5e3449bcc3) and states that it has no interior.

The hood, cockpit and stunt interactions remain in the clearly labeled **Motion prototype**, which uses the original stylized car. They do not operate the Sketchfab model. To apply these interactions to the exact exterior, a properly licensed GLB/GLTF/FBX source asset is needed, followed by mesh preparation, rigging and a separately modeled interior. Embedding the viewer does not grant a license to redistribute the asset.

The prototype loads only on demand. Its renderer and audio stop when returning to the reference exterior, and the embed unloads while the prototype is active.

## Motion prototype features

- A deterministic 720-frame / 24-second 3D sequence: approach, inverted ramp climb, aerial roll, landing.
- Pause/play, replay, single-frame stepping, scrubbing and 0.25×/0.5×/1× playback.
- Interactive hood, cabin, rear wing, wheels, and cold-gas thruster concept.
- Animated butterfly-style door and camera entry, steering yoke interaction, explicit exit control.
- Three paint finishes, exterior drag-to-orbit, limited cockpit look-around.
- Original synthesized cinematic sound, opt-in and muted initially.
- Responsive layouts, keyboard controls, reduced-motion support, WebGL fallback.

The motion prototype vehicle, interior, mechanisms and stunt are artistic interpretations, not production geometry, validated physics or engineering specifications. This is not an official Tesla website. Official information: https://www.tesla.com/roadster

Three.js 0.180.0 is vendored in `dist/assets/` under its MIT license. No Tesla footage, proprietary CAD, or third-party audio is included. The frame sequence is rendered in real time, not extracted from an official stunt video.

## GitHub Pages

The root `index.html` opens the application in `dist/`. This repository can be published with GitHub Pages using the `main` branch and `/ (root)` directory.
