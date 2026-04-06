# JS Solution

`solutions/web-js` is the browser-first implementation.

## Runtime split

- `src/app/main-ar.js`: A-Frame + AR.js entrypoint for live marker tracking.
- `src/app/main-debug.js`: camera-free developer scene.

Both entrypoints use the same task modules and math utilities.

## Task modules

- `task1-field`: four-marker surface reconstruction, layout validation, surface transforms.
- `task2-object-detection`: stub detector and debug object provider.
- `task3-light`: light pose extraction from marker-like inputs.
- `task4-shadow`: ray-plane projection and shadow style mapping.

## Debug-first design

The JS solution treats debug mode as a production-grade engineering tool for the team:

- fake markers, fake light, and fake object providers;
- gizmos for axes, normals, rays, plane grid, labels, and projected point;
- DOM debug panel with numeric state and error reporting;
- toggles to enable or disable individual helpers.

AR.js is only one data source. The math and visualization pipeline remain testable without it.
