# Local Setup

## Prerequisites

- Node.js 20+
- Python 3.11+
- npm

## Web JS solution

```bash
cd solutions/web-js
npm install
npm run dev
```

## Python backend

```bash
cd solutions/python-web/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Python frontend

```bash
cd solutions/python-web/frontend
npm install
npm run dev
```

## Debug workflow

1. Start the relevant app in debug mode.
2. Move fake markers, light, and object via config or UI controls.
3. Inspect overlay values for field validity, light pose, and projection status.
4. Only after math is stable, switch to live AR marker input.
