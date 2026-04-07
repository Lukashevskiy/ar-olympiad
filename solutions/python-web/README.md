# Python Web Solution

FastAPI backend plus JS frontend. The main standalone pages are [`task2.html`](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html) for object detection, [`task3.html`](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html) for light source tracking, and [`task4.html`](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task4.html) for shadow projection.

## Backend

- `GET /health`
- `POST /api/detect/object`
- `POST /api/project/shadow`

`/api/detect/object` now supports:

- `detectorMode: "mock"` for the old stub response
- `detectorMode: "ball-cv"` for a baseline CV detector that finds a bright orange/red ball in a field image and returns `ObjectPose`

## Frontend

- `/`: generic scene + API integration
- `/task2.html`: live Task 2 page with webcam, field markers, light marker, backend ball detection, and shadow projection
- `/task3.html`: live Task 3 page with webcam, light marker tracking, and multiple light modes
- `/task4.html`: live Task 4 page with webcam, field markers, light marker, object capture, and responsive shadow projection

`/task2.html` uses the webcam stream from AR.js, computes `FieldPose` from four markers, captures a live frame, and calls the backend in `ball-cv` mode.

`/task3.html` uses the webcam stream from AR.js and a dedicated light marker to drive ambient or directional light.

`/task4.html` uses the webcam stream from AR.js, captures the detected object, and continuously reprojects the shadow as the light source moves.

Task 2 explanation:

- [Task 2 README](/home/dmitriyl/olypiad_ar_task/solutions/python-web/task-2/README.md)

Task 3 explanation:

- [Task 3 README](/home/dmitriyl/olypiad_ar_task/solutions/python-web/task-3/README.md)

Task 4 explanation:

- [Task 4 README](/home/dmitriyl/olypiad_ar_task/solutions/python-web/task-4/README.md)

## Run

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
