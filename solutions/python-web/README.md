# Python Web Solution

Split MVP with FastAPI backend and a small JS frontend.

## Backend

- `GET /health`
- `POST /api/detect/object`
- `POST /api/project/shadow`

## Frontend

- `/`: scene + API integration
- `/debug.html`: debug payload and overlay mode

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
