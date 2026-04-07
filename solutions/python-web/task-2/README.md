# Task 2 — Распознавание объекта внутри поля

## Назначение

Решение `Task 2` отвечает за обнаружение объекта внутри уже восстановленного поля и формирование `ObjectPose`, который затем используется для построения тени.

В данном варианте реализован baseline для **конкретного объекта простой формы**:

- объект: **мяч**
- метод: **алгоритм компьютерного зрения**
- ограничение: объект должен находиться **внутри поля**, заданного маркерами из `Task 1`

По этому pipeline система:

1. получает `FieldPose` из первой задачи;
2. получает изображение кадра;
3. получает 4 угла поля в координатах изображения;
4. строит polygon mask поля;
5. ищет мяч только внутри этой области;
6. формирует `ObjectPose`;
7. передаёт результат в shadow pipeline.

## Соответствие пунктам задания

Формулировка задачи допускает:

- конкретный объект простой формы;
- конкретный объект сложной формы;
- любой объект внутри поля;
- алгоритм на нейросетях;
- алгоритм на классическом computer vision.

В данном решении реализован вариант:

- **конкретный объект простой формы**;
- **мяч**;
- **классический computer vision**;
- **поиск объекта только внутри поля**, ограниченного маркерами.

## Входной debug entrypoint

Для демонстрации используется:

- [debug.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/debug.html)

Логика запуска:

- [main-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/main-debug.js)

В debug-режиме можно:

- загрузить реальный кадр;
- вручную задать 4 угла поля в координатах изображения;
- отправить кадр и границу поля в backend;
- получить `ObjectPose` мяча и дальше построить тень.

## Входной HTML

Исходный HTML-файл для `Task 2`:

- [debug.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/debug.html)

Код:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AR Olympiad Python Web Debug</title>
    <style>
      body { margin: 0; font-family: monospace; background: #10151d; color: #e5edf5; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main-debug.js"></script>
  </body>
</html>
```

Что здесь важно:

- `#app` является контейнером для debug workbench;
- в отличие от `Task 1`, здесь нет AR.js-сцены и marker entities;
- основная логика запускается через `main-debug.js`;
- интерфейс строится как инженерная страница для проверки detection pipeline по изображению.

## Что добавлено относительно Task 1

Если в `Task 1` основная логика строилась вокруг маркеров и геометрии поля, то в `Task 2` поверх этого добавлены новые части:

- загрузка изображения кадра;
- ручная установка 4 углов поля в координатах изображения;
- передача `imageBase64` и `fieldImageCorners` в backend;
- запуск CV-детекции мяча;
- overlay полигона поля поверх изображения;
- показ статуса детекции и полученного `ObjectPose`.

Файлы, которые отвечают именно за эти добавления:

- [main-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/main-debug.js)
- [detection-debug-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/debug/detection-debug-controls.js)
- [debug-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/debug/debug-view.js)
- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js)
- [ball-frame-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/ball-frame-debug.js)

## Основные файлы решения

Backend:

- [detection.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/detection.py)
- [models.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/domain/models.py)
- [detection_service.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/detection_service.py)
- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Frontend:

- [main-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/main-debug.js)
- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js)
- [detection-debug-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/debug/detection-debug-controls.js)
- [debug-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/debug/debug-view.js)
- [ball-frame-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/ball-frame-debug.js)

## Участки кода, которые отвечают за решение

### 1. Контракт запроса на детекцию

Файл:

- [models.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/domain/models.py)

Код:

```python
class DetectionRequest(BaseModel):
    frameId: str = "debug-frame"
    fieldPose: FieldPose
    debug: bool = True
    detectorMode: str = "mock"
    imageBase64: Optional[str] = None
    fieldImageCorners: Optional[List[Vec3]] = None
```

Комментарий:

- backend получает не только `FieldPose`, но и само изображение;
- `fieldImageCorners` задают границу поля в координатах кадра;
- это позволяет искать объект не по всему кадру, а только внутри поля.

### 2. Выбор режима детекции

Файл:

- [detection_service.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/detection_service.py)

Код:

```python
def detect_object(request: dict) -> dict:
    detector_mode = request.get("detectorMode", "mock")
    field_pose = request["fieldPose"]

    if detector_mode == "ball-cv" and request.get("imageBase64"):
        detected = detect_ball_object_pose(
            request["imageBase64"],
            field_pose,
            request.get("fieldImageCorners"),
        )
        if detected is not None:
            return detected

    return mock_detect_object(field_pose)
```

Комментарий:

- `ball-cv` включает реальный baseline detector для мяча;
- если мяч не найден, сервис возвращает fallback;
- основной путь решения при этом остаётся чисто CV.

### 3. Построение polygon mask поля

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
def _corners_to_polygon(field_image_corners, image_width, image_height) -> np.ndarray:
    if not field_image_corners or len(field_image_corners) != 4:
        return _default_field_polygon(image_width, image_height)

    polygon = []
    for corner in field_image_corners:
        x = corner.get("x", 0.0)
        y = corner.get("y", 0.0)

        if 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0:
            px = int(round(x * (image_width - 1)))
            py = int(round(y * (image_height - 1)))
        else:
            px = int(round(x))
            py = int(round(y))

        polygon.append([px, py])

    return np.array(polygon, dtype=np.int32)
```

Комментарий:

- углы поля переводятся в polygon в пикселях;
- polygon задаёт допустимую область поиска объекта;
- именно этот шаг связывает `Task 2` с результатом `Task 1`.

### 4. Ограничение поиска только областью поля

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
field_polygon = _corners_to_polygon(field_image_corners, image_width, image_height)
field_mask = _build_field_mask(image_width, image_height, field_polygon)

mask_a = cv2.inRange(hsv, lower_a, upper_a)
mask_b = cv2.inRange(hsv, lower_b, upper_b)
color_mask = cv2.bitwise_or(mask_a, mask_b)
color_mask = cv2.medianBlur(color_mask, 5)
mask = cv2.bitwise_and(color_mask, field_mask)
```

Комментарий:

- сначала выделяется цветовая маска мяча;
- затем она пересекается с маской поля;
- объект вне поля автоматически исключается из поиска.

### 5. Проверка, что мяч целиком находится внутри поля

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
def _is_circle_inside_field(field_mask, center_x, center_y, radius) -> bool:
    sample_points = [
        (center_x, center_y),
        (center_x - radius, center_y),
        (center_x + radius, center_y),
        (center_x, center_y - radius),
        (center_x, center_y + radius),
    ]

    for px, py in sample_points:
        ix = int(round(px))
        iy = int(round(py))
        if field_mask[iy, ix] == 0:
            return False
    return True
```

Комментарий:

- проверяется не только центр мяча;
- дополнительно проверяются крайние точки окружности;
- если мяч частично выходит за пределы поля, такая детекция не принимается.

### 6. Формирование `ObjectPose`

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
u = max(0.0, min(1.0, best["center_x"] / max(1.0, image_width - 1)))
v = max(0.0, min(1.0, best["center_y"] / max(1.0, image_height - 1)))
size = _estimate_ball_size(field_pose, best["radius"], image.shape)
height_above_field = size["y"] * 0.5
position = _surface_point_with_height(field_pose, u, v, height_above_field)

return {
    "className": "ball",
    "position": position,
    "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
    "size": size,
    "confidence": round(confidence, 4),
}
```

Комментарий:

- положение мяча на изображении переводится в нормированные координаты `u, v`;
- затем точка объекта переносится на поверхность поля;
- на выходе получается `ObjectPose`, совместимый с shadow pipeline.

### 7. Передача изображения и углов поля из frontend

Файл:

- [main-debug.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/main-debug.js)

Код:

```js
const detection = await detectObject(buildDetectionRequest(state.fieldPose, {
  detectorMode: 'ball-cv',
  imageBase64: state.frame.imageBase64,
  fieldImageCorners: cornersMapToArray(state.fieldImageCorners)
}));
```

Комментарий:

- frontend передаёт backend-у кадр;
- вместе с ним передаются 4 угла поля на изображении;
- backend использует эти данные для детекции мяча внутри ограниченной области.

## Запуск

Backend:

```bash
cd /home/dmitriyl/olypiad_ar_task/solutions/python-web/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd /home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend
npm install
npm run dev
```

Открыть:

- `http://localhost:5174/debug.html`

## Что демонстрирует это решение

- `Task 1` задаёт границу поля;
- `Task 2` ищет объект только внутри этой границы;
- в качестве объекта используется мяч;
- детекция реализована через CV;
- результат формируется как `ObjectPose` и может быть передан в задачу построения тени.
