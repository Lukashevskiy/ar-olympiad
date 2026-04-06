# Common Architecture

The monorepo is organized by both solution track and olympiad task. This keeps the same domain language across implementations while allowing different execution models.

## Layers

- `shared/schemas`: cross-solution payload examples and contracts.
- `specs/`: normative behavior for APIs, markers, math, and debug mode.
- `solutions/*/src|app`: app wiring and entrypoints.
- `solutions/*/tasks`: task-oriented modules for field, object, light, and shadow.
- `solutions/*/math` or `backend/app/services`: pure geometry and validation logic.
- `solutions/*/debug`: developer mode state, fake providers, gizmos, overlays.
- `solutions/*/ui`: panels and status presentation.

## First-class debug mode

Debug mode is part of the architecture, not an afterthought. It exists to:

- validate plane math independently from AR.js or camera input;
- manually move markers, light, and object entities;
- inspect intermediate vectors, normals, distances, and confidence values;
- expose projection failure causes in a stable engineering UI.

All core geometry is designed as pure functions so both AR mode and debug mode call the same logic.
