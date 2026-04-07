# Python Web Task 2

Отдельное решение второй задачи на FastAPI и небольшом JS frontend.

## Что входит

- backend endpoint `POST /api/detect/object`
- baseline CV-детектор мяча
- ограничение поиска областью поля
- debug страница для загрузки кадра и ручного задания границы поля
- shadow projection для проверки результата детекции в полном pipeline

## Страницы

- `/debug.html` — основной debug workbench для `Task 2`

## Основные каталоги

- `backend/app/api/`: API endpoints
- `backend/app/services/`: orchestration и shadow projection
- `backend/app/cv/`: CV-логика поиска мяча
- `frontend/src/app/`: запуск debug UI
- `frontend/src/debug/`: элементы debug workbench
- `task-2/README.md`: подробное пояснение по задаче
