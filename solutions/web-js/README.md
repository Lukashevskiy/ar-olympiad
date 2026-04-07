# Web JS Solution

Browser-first MVP using A-Frame, AR.js, and pure JavaScript.

## Entrypoints

- `/`: AR mode with marker-based scene.
- `/debug.html`: camera-free debug mode with synthetic markers and full gizmos.
- `/task1.html`: minimal standalone Task 1 AR demo.
- `/task1-debug.html`: minimal standalone Task 1 debug demo.
- `/task2-debug.html`: standalone Task 2 debug demo with Task 1 field controls and object controls.

## Structure

- `src/app/`: app wiring and shared runtime.
- `src/tasks/`: olympiad tasks.
- `src/math/`: pure geometry utilities.
- `src/debug/`: fake providers and gizmos.
- `src/ui/`: overlays and debug panels.

## Run

```bash
npm install
npm run dev
```
