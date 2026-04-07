# Task 2 — Распознавание объекта внутри поля

## Назначение

Вторая задача отвечает за распознавание объекта внутри поля, которое задано маркерами, и за передачу результата в алгоритм построения тени.

В этом решении реализован полный рабочий pipeline:

1. камера запускается через `A-Frame + AR.js`;
2. четыре маркера поля формируют `FieldPose`;
3. отдельный маркер света формирует `LightPose`;
4. текущий кадр с камеры захватывается во frontend;
5. backend ищет мяч только внутри области поля;
6. backend возвращает `ObjectPose`;
7. по найденному объекту строится `ShadowProjection`;
8. объект и тень отображаются обратно в AR-сцене.

## Соответствие постановке

Формулировка допускает:

- конкретный объект простой формы;
- конкретный объект сложной формы;
- любой объект внутри поля;
- реализацию через нейросети;
- реализацию через computer vision.

В этом варианте выбрано:

- конкретный объект простой формы;
- мяч;
- классический computer vision;
- ограничение поиска только областью поля.

## Входной HTML

Основная страница решения:

- [task2.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html)

Полный HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AR Olympiad | Task 2 Ball Detection</title>
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  </head>
  <body>
    <div id="app">
      <section id="controls-panel">
        <div id="controls-title">Task 2 Controls</div>
        <div id="controls-hint">
          Live Task 2: detect the ball inside the field defined by four markers and build shadow from the detected object.
        </div>
        <div id="controls-status"></div>
        <div id="controls-body"></div>
      </section>

      <div id="task2-layout">
        <section id="task2-scene">
          <h2 id="scene-title">Task 2 Ball Detection</h2>
          <div id="scene-summary"></div>
          <div id="scene-shell">
            <a-scene
              id="ar-scene"
              embedded
              vr-mode-ui="enabled: false"
              renderer="colorManagement: true"
              arjs="sourceType: webcam; debugUIEnabled: false;"
            >
              <a-camera active="true" position="0 0 0"></a-camera>
              <a-sphere id="task2-object" radius="0.05" color="#ff8a00" visible="false"></a-sphere>
              <a-plane id="task2-shadow" width="0.1" height="0.1" rotation="-90 0 0" visible="false"></a-plane>
            </a-scene>
          </div>
          <div id="preview-wrapper">
            <img id="frame-preview" alt="Task 2 detection frame preview" />
            <svg id="field-overlay" viewBox="0 0 100 100">
              <polygon
                id="field-polygon"
                fill="rgba(59, 130, 246, 0.18)"
                stroke="#7dd3fc"
                stroke-width="0.8"
              ></polygon>
            </svg>
          </div>
        </section>

        <pre id="task2-json"></pre>
      </div>
    </div>
    <script type="module" src="/src/app/task2.js"></script>
  </body>
</html>
```

Что здесь важно:

- используется живая камера, а не загруженный кадр;
- маркеры читаются прямо в AR-сцене;
- в сцене уже есть proxy-объект и proxy-тень;
- в HTML вынесены основные UI-блоки;
- страница является боевым entrypoint второй задачи.

## Основные файлы решения

### Frontend

- [task2.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html)
- [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js)
- [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js)
- [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js)
- [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/marker-pose-registry.js)
- [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js)
- [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js)
- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js)
- [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js)
- [task2-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/task2-controls.js)
- [task2-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/task2-view.js)
- [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js)
- [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js)
- [client.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/api/client.js)

### Backend

- [detection.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/detection.py)
- [shadow.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/shadow.py)
- [models.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/domain/models.py)
- [detection_service.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/detection_service.py)
- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)
- [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py)

## Участки кода, которые отвечают за решение

### 1. Подключение камеры и AR-маркеров

Файл:

- [task2.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html)

Код:

```html
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```

Комментарий:

- frontend запускает webcam pipeline;
- `AR.js` отвечает за распознавание маркеров;
- отсюда решение получает реальную сцену.

### 2. Подключение field markers

Файл:

- [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js)

Код:

```javascript
export const FIELD_MARKER_DEFINITIONS = [
  { id: 'field-nw', patternUrl: pattern1Url, size: 0.16 },
  { id: 'field-ne', patternUrl: pattern2Url, size: 0.16 },
  { id: 'field-se', patternUrl: pattern3Url, size: 0.16 },
  { id: 'field-sw', patternUrl: pattern4Url, size: 0.16 }
];
```

Комментарий:

- у поля есть четыре фиксированных маркера;
- каждому углу соответствует свой `.patt` файл;
- это напрямую соответствует первой задаче.

### 3. Хранилище поз маркеров

Файл:

- [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/marker-pose-registry.js)

Код:

```javascript
export function createMarkerPoseRegistry() {
  const store = {};

  return {
    update(markerId, patch) {
      store[markerId] = {
        ...(store[markerId] || { visible: false, position: null, axes: null }),
        ...patch
      };
    },
    getAll() {
      return { ...store };
    }
  };
}
```

Комментарий:

- registry хранит текущие состояния всех маркеров;
- `Task 1` читает из него полную картину по углам поля;
- это связка между AR-слоем и математикой поля.

### 4. Чтение позы маркеров

Файл:

- [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js)

Код:

```javascript
const pose = readPoseFromObject3D(element.object3D);
registry.update(definition.id, {
  visible: true,
  position: pose.position,
  axes: pose.axes
});
```

Комментарий:

- для каждого видимого маркера читается мировая позиция;
- дополнительно читаются локальные оси;
- эти данные затем используются для построения `FieldPose`.

### 5. Построение `FieldPose`

Файл:

- [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js)

Код:

```javascript
export function buildFieldPose(markerMap) {
  const [nw, ne, se, sw] = markers.map((marker) => marker.position);
  const geometricNormal = normalize(cross(sub(ne, nw), sub(sw, nw)));
  const markerNormals = markers
    .map((marker) => marker.axes?.up)
    .filter(Boolean);
```

Комментарий:

- поле строится по четырём маркерам;
- из геометрии маркеров получаются углы, размеры и нормаль;
- дополнительно учитываются нормали самих маркеров;
- на выходе получается `FieldPose`, пригодный для детекции и тени.

### 6. Проекция углов поля в координаты кадра

Файл:

- [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js)

Код:

```javascript
export function projectWorldPointToImage(point, camera) {
  const vector = new THREE.Vector3(point.x, point.y, point.z);
  vector.project(camera);

  return {
    x: Math.max(0, Math.min(1, (vector.x + 1) * 0.5)),
    y: Math.max(0, Math.min(1, (1 - vector.y) * 0.5)),
    z: vector.z
  };
}
```

Комментарий:

- углы поля переводятся из мировых координат в координаты изображения;
- это связывает AR-поле и backend CV detector;
- backend затем ограничивает поиск мяча polygon mask области поля.

### 7. Формирование detection request

Файл:

- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js)

Код:

```javascript
export function buildDetectionRequest(fieldPose, options = {}) {
  return {
    frameId: 'frontend-debug-frame',
    fieldPose,
    debug: true,
    detectorMode: options.detectorMode || 'mock',
    imageBase64: options.imageBase64 || null,
    fieldImageCorners: options.fieldImageCorners || null
  };
}
```

Комментарий:

- frontend собирает единый payload для backend;
- в него входят поле, изображение и углы поля;
- это официальный вход во вторую задачу со стороны frontend.

### 8. Захват живого кадра

Файл:

- [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js)

Код:

```javascript
const video = document.querySelector('video');
context.drawImage(video, 0, 0, canvas.width, canvas.height);
return {
  imageBase64: canvas.toDataURL('image/jpeg', 0.92),
  width: canvas.width,
  height: canvas.height
};
```

Комментарий:

- frontend берёт текущий кадр прямо из webcam stream;
- кадр сериализуется в `imageBase64`;
- именно этот кадр отправляется в backend detector.

### 9. Запуск backend API

Файлы:

- [client.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/api/client.js)
- [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js)

Код:

```javascript
const detection = await detectObject(buildDetectionRequest(state.fieldPose, {
  detectorMode: 'ball-cv',
  imageBase64: frame.imageBase64,
  fieldImageCorners: state.fieldImageCorners
}));
const shadow = await projectShadow(
  buildShadowRequest(state.fieldPose, state.lightPose, detection.objectPose)
);
```

Комментарий:

- frontend вызывает оба backend endpoint:
  - детекцию объекта;
  - проекцию тени;
- это делает `Task 2` полноценным end-to-end pipeline.

### 10. Light marker и fallback света

Файлы:

- [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js)
- [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js)

Код:

```javascript
const lightMarker = lightSource.refresh();
state.lightPose = lightMarker || createLightPose();
```

Комментарий:

- если light marker виден, используется его живая поза;
- если маркер света временно не виден, используется fallback `LightPose`;
- это не рвёт pipeline тени.

### 11. Ограничение детекции областью поля

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
field_polygon = _corners_to_polygon(field_image_corners, image_width, image_height)
field_mask = _build_field_mask(image_width, image_height, field_polygon)
mask = cv2.bitwise_and(color_mask, field_mask)
```

Комментарий:

- backend строит polygon mask поля;
- поиск мяча идёт только внутри этой маски;
- объект вне поля не считается валидной детекцией.

### 12. Формирование `ObjectPose`

Файл:

- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

Код:

```python
return {
    "className": "ball",
    "position": position,
    "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
    "size": size,
    "confidence": round(confidence, 4),
}
```

Комментарий:

- backend возвращает объект в общем формате `ObjectPose`;
- этот результат напрямую используется в задаче тени.

### 13. Построение тени

Файл:

- [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py)

Код:

```python
point = _add(ray_origin, _scale(ray_direction, t))
return {
    "position": {"x": point["x"], "y": field_origin["y"] + 0.002, "z": point["z"]},
    "rotation": {"x": -90.0, "y": object_pose["rotation"]["y"], "z": 0.0},
    "scale": {
        "x": object_pose["size"]["x"] * stretch,
        "y": 1.0,
        "z": object_pose["size"]["z"] * (1.0 + stretch * 0.35),
    },
```

Комментарий:

- тень строится уже от найденного объекта;
- используется поле, свет и `ObjectPose`;
- это даёт полный pipeline второй задачи.

### 14. Отрисовка результата обратно в сцене

Файл:

- [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js)

Код:

```javascript
updateObjectProxy(objectProxy, state.objectPose);
updateShadowProxy(shadowProxy, state.shadowProjection);
view.render({
  mode: 'task2-live',
  fieldPose: state.fieldPose,
  lightPose: state.lightPose,
  objectPose: state.objectPose,
  shadowProjection: state.shadowProjection,
  previewUrl: state.previewUrl,
  fieldImageCorners: state.fieldImageCorners,
  detectionStatus: state.detectionStatus
});
```

Комментарий:

- результат backend не остаётся только в JSON;
- найденный объект показывается в AR-сцене;
- тень тоже отображается в сцене;
- отдельный view показывает диагностическую информацию и preview кадра.

## Проверка покрытия решения

В README учтены все основные части live `Task 2`:

- HTML entrypoint;
- камера и `AR.js`;
- field markers;
- registry состояний маркеров;
- чтение world pose маркеров;
- построение `FieldPose`;
- проекция углов поля в координаты кадра;
- захват кадра;
- сборка detection request;
- вызовы backend API;
- light marker и fallback света;
- ограничение поиска внутри поля;
- формирование `ObjectPose`;
- построение тени;
- отображение объекта и тени обратно в сцене.

## Как запустить

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

Открыть:

- `http://localhost:5174/task2.html`

## Что показывает это решение

- поле восстанавливается по четырём маркерам;
- мяч ищется только внутри этого поля;
- используется живая камера;
- детекция идёт через backend CV;
- после детекции строится тень;
- объект и тень отображаются обратно в AR-сцене.
