# Updates

## Uploaded model integration — 26 October 2026

- Replaced the procedural car and separate Sketchfab viewer with the actual GLB from `tesla-roadster-20.zip`.
- Preserved the supplied mesh geometry, UVs, body maps and exterior proportions.
- Used the same imported car throughout the landing page, close-ups and 720-frame stunt.
- Grouped the four original wheel assemblies around their axle centers for animation.
- Added front, canopy, rear, wheel and thruster inspections with accurate labels for the supplied exterior-only asset.
- Removed controls that implied the connected shell had separate hood/door panels or an included cockpit.
- Added compressed-model loading, real download progress and load-error recovery.
- Optimized wheel texture resolution and duplicate payloads, while retaining the body maps at full resolution.
- Tuned showroom lighting and framing for the imported car.
- Prevented negative animation deltas when starting playback between browser frames.
- Reduced the 67 MB source to a 15.3 MB download; verified that all 292 geometry accessors retain the original bytes.
- Verified desktop and 390 × 844 phone views, front/canopy alternate views, wheel and plume controls, sound toggle, and frame stepping (340 → 341). JavaScript syntax and whitespace checks passed; no browser console warnings or errors were captured.

## Exact exterior reference showroom — 25 October 2026

- Replaced the default landing-page vehicle with the exact The3DBoss Roadster reference through its official Sketchfab viewer.
- Added responsive desktop and phone showroom layouts, orbit/zoom instructions, direct viewer fallback, and visible creator attribution.
- Kept the original hood, cabin, wheels, thrusters and frame-by-frame stunt in a clearly labeled, separate Motion prototype.
- Added on-demand Three.js loading; suspended its rendering/audio when viewing the reference and unloaded the reference when using the prototype.
- Updated credits and documentation to distinguish the creator’s exterior from Yash’s interaction prototype.
- Verified desktop and 390 × 844 phone layouts; model switching, hood controls, cabin entry/exit, and frame stepping (340 → 341). The local page reported no captured console warnings or errors.
- Exact-model hood/door animation remains dependent on a licensed source model; the reference asset has no interior. No asset files were extracted or redistributed.

## Initial complete experience — 24 October 2026

- Built the dark “Beyond Gravity” landing page with responsive desktop and phone layouts.
- Created an original interactive 3D Roadster-inspired vehicle and showroom.
- Added a deterministic 720-frame, 24-second stunt sequence: approach, inverted ramp climb, aerial roll, and landing.
- Added timeline scrubbing, pause/play, replay, one-frame stepping, and 0.25×/0.5×/1× playback.
- Added an animated opening hood with an illustrative electric-system/front-compartment view.
- Added animated doors, an exterior-to-cockpit camera transition, steering-yoke interaction, and an exit-interior button.
- Added rear-wing deployment, detailed spinning wheels, brakes, and cold-gas thruster visual effects.
- Added three paint colors, exterior drag-to-orbit, and cockpit look-around.
- Added original synthesized electric motor, air-thrust, and interface sounds with an opt-in mute control.
- Added keyboard controls, reduced-motion handling, and a WebGL fallback.
- Bundled the Three.js modules and fonts locally; reduced wheel draw calls by merging compatible geometry.
- Corrected excessive showroom brightness, desktop panel crowding, mobile vehicle framing, and inverted-stunt camera placement.

## Initial-release validation

JavaScript syntax checks passed. Browser checks covered desktop and 390 × 844 phone layouts; hood, interior entry/exit, steering, wheel spin, rear wing, thruster, sound and frame-step controls. The final browser reload reported no captured console errors or warnings.

## Creative scope

This is an independent portfolio concept. The current vehicle uses the uploaded model; the stunt, plumes and synthesized sounds are artistic effects, not official footage, actual vehicle audio or validated physics. The current asset supports exterior inspection and wheel animation. Earlier release notes describe features of the old procedural prototype that has now been removed.
