# Task 2 — Распознавание объекта внутри поля

## Назначение

Вторая задача отвечает за распознавание объекта внутри поля, которое уже восстановлено по маркерам, и за перевод результата в `ObjectPose`, пригодный для последующего построения тени. В этой реализации выбран максимально понятный и демонстрационный вариант: система ищет мяч как конкретный объект простой формы, а сама детекция выполняется классическим computer vision-алгоритмом на backend.

С практической точки зрения `Task 2` здесь устроен как связка двух уровней. На frontend поле восстанавливается в live AR-сцене и переводится в координаты кадра. Затем текущий кадр камеры и граница поля отправляются в backend, где строится маска допустимой области поиска и выполняется детекция мяча только внутри этой области. После этого backend возвращает `ObjectPose`, а frontend сразу использует его для дальнейшего pipeline тени.

## Входной HTML

Основная страница решения находится в [task2.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task2.html). Важный момент здесь в том, что HTML играет роль не просто оболочки, а явного каркаса всего решения: слева живёт AR-сцена, ниже показывается preview кадра и полигона поля, справа отображается полный JSON состояния, а модульный JS только заполняет уже существующую структуру.

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

Этот HTML важен потому, что он сразу показывает архитектурную идею второй задачи: распознавание объекта здесь не существует само по себе, оно встроено в живую AR-сцену и связано с уже существующим полем.

## Основные файлы решения

Основной live pipeline проходит через [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js), где собирается состояние сцены. Восстановление поля опирается на [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js), [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js), [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/marker-pose-registry.js), [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js) и [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js). Захват кадра и сборка запроса выполняются через [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js) и [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js). Отображение состояния на странице организуют [task2-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/task2-controls.js) и [task2-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/task2-view.js). На backend ключевую роль играют [detection.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/detection.py), [detection_service.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/detection_service.py), [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py), [shadow.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/shadow.py) и [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py).

## Участки кода, которые отвечают за решение

### 1. Подключение камеры и AR-маркеров

Вторая задача начинается с той же AR-базы, что и первая: камера запускается через `A-Frame + AR.js`, а сцена становится источником живых pose-данных по маркерам.

```html
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```

Именно здесь решение получает реальный видеопоток, в котором потом будут одновременно видны и поле, и объект.

### 2. Field markers как опора для локализации объекта

Как и в первой задаче, поле задаётся четырьмя маркерами. Они описаны в [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js) и привязывают доменные идентификаторы углов к конкретным `.patt` файлам.

```javascript
export const FIELD_MARKER_DEFINITIONS = [
  { id: 'field-nw', patternUrl: pattern1Url, size: 0.16 },
  { id: 'field-ne', patternUrl: pattern2Url, size: 0.16 },
  { id: 'field-se', patternUrl: pattern3Url, size: 0.16 },
  { id: 'field-sw', patternUrl: pattern4Url, size: 0.16 }
];
```

Важно не просто то, что здесь перечислены маркеры, а то, что вся последующая логика второй задачи опирается именно на эту топологию углов поля.

### 3. Хранилище поз маркеров

Чтобы поле можно было собирать из потока AR-состояния, frontend использует промежуточный registry из [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/marker-pose-registry.js).

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

Эта прослойка делает решение устойчивым и понятным: AR-слой только обновляет состояния маркеров, а математический слой поля уже читает их в удобном доменном виде.

### 4. Чтение позы маркеров

Само чтение позы происходит в [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js), где для каждого видимого маркера вычисляются мировая позиция и локальные оси.

```javascript
const pose = readPoseFromObject3D(element.object3D);
registry.update(definition.id, {
  visible: true,
  position: pose.position,
  axes: pose.axes
});
```

Эта часть важна потому, что `Task 2` не может честно ограничить поиск объектом “внутри поля”, если само поле ещё не сведено к устойчивой геометрии в мировой системе координат.

### 5. Построение `FieldPose`

Когда registry обновлён, frontend собирает `FieldPose` в [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js). Здесь поле не просто распознаётся как прямоугольник, а получает размеры, оси, нормаль и качество реконструкции.

```javascript
export function buildFieldPose(markerMap) {
  const [nw, ne, se, sw] = markers.map((marker) => marker.position);
  const geometricNormal = normalize(cross(sub(ne, nw), sub(sw, nw)));
  const markerNormals = markers
    .map((marker) => marker.axes?.up)
    .filter(Boolean);
```

На этом шаге `Task 2` фактически наследует результат первой задачи: локализация объекта будет считаться корректной только в том случае, если само поле построено надёжно.

### 6. Проекция углов поля в координаты кадра

После восстановления поля его углы нужно перевести в координаты изображения. Для этого используется [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js).

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

Этот переход особенно важен, потому что backend detector работает уже не с world-space углами, а с polygon mask в координатах самого кадра.

### 7. Формирование detection request

Контракт запроса вынесен в [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js). Благодаря этому frontend не склеивает request “вручную” каждый раз, а формирует единый payload с известной структурой.

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

Важный смысл этого куска кода в том, что backend получает не просто картинку, а уже контекст задачи: какое поле построено, какой режим детекции выбран и где на изображении проходит граница поля.

### 8. Захват живого кадра

Текущий кадр камеры снимается через [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js). Этот модуль буквально связывает AR-видеопоток и backend CV-детектор.

```javascript
const video = document.querySelector('video');
context.drawImage(video, 0, 0, canvas.width, canvas.height);
return {
  imageBase64: canvas.toDataURL('image/jpeg', 0.92),
  width: canvas.width,
  height: canvas.height
};
```

С инженерной точки зрения это тот момент, когда живая AR-сцена превращается в входные данные для алгоритма распознавания.

### 9. Запуск backend API

После того как кадр и поле готовы, frontend через [client.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/api/client.js) и [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js) вызывает оба backend endpoint: сначала детекцию объекта, а затем проекцию тени.

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

Это превращает задачу во вполне законченный end-to-end pipeline, где распознавание объекта больше не изолировано от остальной сцены.

### 10. Light marker и fallback света

Хотя главная цель второй задачи — распознавание объекта, live pipeline уже учитывает и источник света. Для этого используется [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js) и fallback из [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js).

```javascript
const lightMarker = lightSource.refresh();
state.lightPose = lightMarker || createLightPose();
```

Такое решение нужно не только для красоты. Благодаря этому после успешной детекции объект уже сразу оказывается встроен в будущий shadow pipeline, даже если light marker в какой-то момент временно исчезает из кадра.

### 11. Ограничение детекции областью поля

Ключевая часть backend-логики находится в [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py). Именно здесь построение поля начинает реально влиять на поиск объекта: backend строит polygon mask и пересекает с ней цветовую маску мяча.

```python
field_polygon = _corners_to_polygon(field_image_corners, image_width, image_height)
field_mask = _build_field_mask(image_width, image_height, field_polygon)
mask = cv2.bitwise_and(color_mask, field_mask)
```

Это и есть главный содержательный смысл второй задачи в данной реализации: объект ищется не “где-то на картинке”, а именно внутри области, которая подтверждена маркерами поля.

### 12. Формирование `ObjectPose`

После нахождения объекта backend переводит результат в единый доменный формат `ObjectPose`. Это снова делается в [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py).

```python
return {
    "className": "ball",
    "position": position,
    "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
    "size": size,
    "confidence": round(confidence, 4),
}
```

Это важно, потому что дальше задача тени уже не должна знать ничего о контурах HSV-маски или о деталях CV. Для неё есть только согласованный `ObjectPose`.

### 13. Построение тени

Даже в рамках второй задачи детекция не останавливается на `ObjectPose`, а сразу продолжается в [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py), где объект проецируется на плоскость поля.

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

В результате `Task 2` становится не только распознаванием ради распознавания, а полноценным промежуточным звеном между полем, объектом и тенью.

### 14. Отрисовка результата обратно в сцене

Последний шаг снова выполняется во frontend, в [task2.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task2.js). Здесь результат backend возвращается в сцену и одновременно сохраняется в диагностическом view.

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

Это место особенно удобно для демонстрации решения: пользователь одновременно видит и AR-сцену, и preview кадра, и полный JSON состояния. То есть распознавание объекта становится прозрачным и объяснимым, а не “чёрным ящиком”.

## Проверка покрытия решения

Этот README описывает вторую задачу как связный pipeline: здесь последовательно покрыты HTML entrypoint, камера и `AR.js`, field markers, registry состояний маркеров, чтение pose маркеров, построение `FieldPose`, проекция углов поля в координаты кадра, захват живого кадра, сборка detection request, вызовы backend API, работа light marker как контекста сцены, ограничение поиска внутри поля, формирование `ObjectPose`, построение тени и возврат результата обратно в сцену.

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
