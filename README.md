# AR Olympiad Monorepo

Reference monorepo for a team AR olympiad task where participants reconstruct a field from four markers, estimate a light source from a separate marker, locate an object inside the field, and project its shadow onto the field plane.

The repository contains two parallel solution tracks:

- `solutions/web-js`: browser-first WebAR implementation on A-Frame, AR.js, and pure JavaScript math.
- `solutions/python-web`: split architecture with a Python backend for detection / projection services and a JS frontend for scene rendering and debug tooling.

Debug mode is a first-class part of the project. It is designed for geometry validation, marker layout debugging, shadow projection analysis, and API inspection without depending on a webcam pipeline.

## Repository layout

- `docs/`: olympiad docs, architecture notes, and development workflow.
- `specs/`: API, marker, math, and debug mode specifications.
- `shared/`: shared domain examples and JSON contracts.
- `assets/`: static assets and marker files.
- `datasets/`: placeholder for training / evaluation data.
- `solutions/web-js/`: full front-end variant with AR mode and debug mode.
- `solutions/python-web/`: backend + frontend variant with mock detection and projection APIs.
- `tools/`: helper scripts for local development and evaluation.

## Task mapping

- `task1-field`: four-marker field reconstruction, plane fitting, validation, surface transform.
- `task2-object-detection`: object detection / stub object provider.
- `task3-light`: light marker tracking and light pose estimation.
- `task4-shadow`: planar shadow projection and visualization.

Each solution keeps the same task split so teams can develop and compare implementations incrementally.

## Run `web-js`

```bash
cd solutions/web-js
npm install
npm run dev
```

Open:

- `http://localhost:5173/` for AR mode.
- `http://localhost:5173/debug.html` for developer mode.

## Run `python-web`

Backend:

```bash
cd solutions/python-web/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd solutions/python-web/frontend
npm install
npm run dev
```

Open:

- `http://localhost:5174/` for API-backed scene mode.
- `http://localhost:5174/debug.html` for frontend debug mode.

## MVP scope in this repository

- Shared domain contracts for `FieldPose`, `LightPose`, `ObjectPose`, `ShadowProjection`, and `DebugState`.
- Working JS MVP with field, light, object, and shadow pipeline in AR mode and camera-free debug mode.
- Working Python MVP with FastAPI mock endpoints, frontend API client, and integrated shadow pipeline.
- Modular debug gizmos, numeric overlays, and failure-state reporting.
