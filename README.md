# Task 1 Branch

Эта ветка содержит автономное решение первой задачи: построение поля по четырём маркерам.

Ветка сфокусирована только на `Task 1`:
- чтение позы четырёх маркеров поля;
- восстановление поверхности поля;
- вычисление нормали, локальных осей и центрального `FieldPose`;
- оценка качества реконструкции;
- получение transform в произвольной точке поверхности.

## Структура

- `assets/`: изображения маркеров и `.patt` файлы.
- `solutions/web-js/`: браузерное решение на A-Frame и AR.js.
- `solutions/web-js/task1.html`: AR-страница для работы с реальными маркерами.
- `solutions/web-js/task1-debug.html`: локальная страница для проверки геометрии без камеры.
- `solutions/web-js/src/tasks/task1-field/README.md`: пояснение к реализации с привязкой к коду.

## Запуск

```bash
cd solutions/web-js
npm install
npm run dev
```

Открыть:

- `http://localhost:5173/task1.html`
- `http://localhost:5173/task1-debug.html`

## Ключевые файлы решения

- `solutions/web-js/src/app/task1-ar.js`
- `solutions/web-js/src/app/task1-debug.js`
- `solutions/web-js/src/tasks/task1-field/ar-marker-source.js`
- `solutions/web-js/src/tasks/task1-field/field-validator.js`
- `solutions/web-js/src/tasks/task1-field/surface-reconstruction.js`
- `solutions/web-js/src/tasks/task1-field/field-transform-service.js`
