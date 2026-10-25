# Updates

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

## Validation

JavaScript syntax checks passed. Browser checks covered desktop and 390 × 844 phone layouts; hood, interior entry/exit, steering, wheel spin, rear wing, thruster, sound and frame-step controls. The final browser reload reported no captured console errors or warnings.

## Creative scope

This is an independent artistic concept. The motion prototype’s vehicle geometry, interior, mechanisms, stunt and sounds are original interpretations, not Tesla CAD, official stunt footage, actual vehicle audio, validated physics, or production specifications. The front hood does not contain a combustion engine.
