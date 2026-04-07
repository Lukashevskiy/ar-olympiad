# Task 2 Branch

Эта ветка содержит автономное решение второй задачи: распознавание объекта внутри поля и подготовка `ObjectPose` для построения тени.

Ветка сфокусирована на `python-web` варианте решения:
- backend на FastAPI;
- baseline CV-детектор мяча;
- ограничение детекции областью поля;
- debug workbench для загрузки кадра, задания границы поля и запуска детекции.

## Структура

- `solutions/python-web/backend/`: API и CV-логика распознавания.
- `solutions/python-web/frontend/`: debug UI и клиент backend API.
- `solutions/python-web/task-2/README.md`: пояснение к реализации с выдержками из кода.

## Запуск

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

Открыть:

- `http://localhost:5174/debug.html`

## Ключевые файлы решения

- `solutions/python-web/backend/app/api/detection.py`
- `solutions/python-web/backend/app/services/detection_service.py`
- `solutions/python-web/backend/app/cv/ball_detector.py`
- `solutions/python-web/frontend/src/app/main-debug.js`
- `solutions/python-web/frontend/src/debug/detection-debug-controls.js`
- `solutions/python-web/task-2/README.md`
