# Roadster — Beyond Gravity

An independent cinematic Roadster concept by Yash Patel. A self-contained, buildless Three.js experience.

![Roadster — Beyond Gravity preview](./preview.jpg)

See [all updates](./CHANGELOG.md).

## Run

Serve `dist/` over HTTP, for example `python3 -m http.server 4173 --directory dist`.

## Features

- A deterministic 720-frame / 24-second 3D sequence: approach, inverted ramp climb, aerial roll, landing.
- Pause/play, replay, single-frame stepping, scrubbing and 0.25×/0.5×/1× playback.
- Interactive hood, cabin, rear wing, wheels, and cold-gas thruster concept.
- Animated butterfly-style door and camera entry, steering yoke interaction, explicit exit control.
- Three paint finishes, exterior drag-to-orbit, limited cockpit look-around.
- Original synthesized cinematic sound, opt-in and muted initially.
- Responsive layouts, keyboard controls, reduced-motion support, WebGL fallback.

The vehicle, interior, mechanisms and stunt are artistic interpretations, not production geometry, validated physics or engineering specifications. This is not an official Tesla website. Official information: https://www.tesla.com/roadster

Three.js 0.180.0 is vendored in `dist/assets/` under its MIT license. No Tesla footage, proprietary CAD, or third-party audio is included. The frame sequence is rendered in real time, not extracted from an official stunt video.

## GitHub Pages

The root `index.html` opens the application in `dist/`. This repository can be published with GitHub Pages using the `main` branch and `/ (root)` directory.
