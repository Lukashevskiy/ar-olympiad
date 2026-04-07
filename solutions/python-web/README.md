# Python Web Solution

Split MVP with FastAPI backend and a small JS frontend.

## Backend

- `GET /health`
- `POST /api/detect/object`
- `POST /api/project/shadow`

`/api/detect/object` now supports:

- `detectorMode: "mock"` for the old stub response
- `detectorMode: "ball-cv"` for a baseline CV detector that finds a bright orange/red ball in a field image and returns `ObjectPose`

## Frontend

- `/`: scene + API integration
- `/debug.html`: debug payload and overlay mode

`/debug.html` uses a synthetic field image with a ball and calls the backend in `ball-cv` mode.

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
