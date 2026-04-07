# Python Web Solution

FastAPI backend plus JS frontend. The main standalone page for the second task is [`task2.html`](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html), where the camera, field markers, backend detection, and shadow projection work together in one flow.

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

`/task2.html` uses the webcam stream from AR.js, computes `FieldPose` from four markers, captures a live frame, and calls the backend in `ball-cv` mode.

Task 2 explanation:

- [Task 2 README](/home/dmitriyl/olypiad_ar_task/solutions/python-web/task-2/README.md)

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
