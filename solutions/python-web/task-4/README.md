# Task 4 — Построение тени на поле

## Назначение

Четвёртая задача отвечает за построение тени объекта на поверхности поля с учётом положения поля, положения источника света и геометрии объекта.

В этом решении реализован live pipeline:

1. по четырём маркерам восстанавливается поле;
2. по отдельному маркеру восстанавливается источник света;
3. объект внутри поля обнаруживается backend CV-алгоритмом;
4. backend строит `ShadowProjection`;
5. frontend визуализирует тень в AR-сцене;
6. тень обновляется при движении источника света.

Дополнительно учтены простые элементы реалистичности:

- зависимость размера тени от расстояния до источника света;
- разделение на umbra и penumbra;
- локальная окклюзия под объектом;
- слабый рефлекс на поверхности.

## Входной HTML

Основная страница:

- [task4.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task4.html)

Полный HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AR Olympiad | Task 4 Shadow Projection</title>
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  </head>
  <body>
    <div id="app">
      <section id="controls-panel">
        <div id="controls-status"></div>
        <div id="controls-body"></div>
      </section>

      <div id="task4-layout">
        <section id="task4-stage">
          <div id="scene-summary"></div>
          <a-scene id="task4-scene" embedded arjs="sourceType: webcam; debugUIEnabled: false;">
            <a-camera active="true" position="0 0 0"></a-camera>
            <a-sphere id="task4-object" visible="false"></a-sphere>
            <a-plane id="task4-penumbra" visible="false"></a-plane>
            <a-plane id="task4-umbra" visible="false"></a-plane>
            <a-plane id="task4-occlusion" visible="false"></a-plane>
            <a-plane id="task4-reflection" visible="false"></a-plane>
          </a-scene>
        </section>

        <pre id="task4-json"></pre>
      </div>
    </div>
    <script type="module" src="/src/app/task4.js"></script>
  </body>
</html>
```

Что здесь важно:

- используется живая камера;
- в сцене есть объект и несколько слоёв тени;
- light marker и field markers участвуют в одном pipeline;
- `task4.html` является отдельным боевым entrypoint.

## Основные файлы решения

### Frontend

- [task4.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task4.html)
- [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js)
- [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js)
- [task4-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/task4-controls.js)
- [task4-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/task4-view.js)
- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/request-builder.js)

Используемые модули из прошлых задач:

- [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js)
- [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js)
- [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js)
- [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js)
- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js)
- [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js)
- [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js)

### Backend

- [shadow.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/shadow.py)
- [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py)
- [models.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/domain/models.py)
- [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py)

## Участки кода, которые отвечают за решение

### 1. Главный live pipeline

Файл:

- [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js)

Код:

```javascript
const detection = await detectObject(buildDetectionRequest(state.fieldPose, {
  detectorMode: 'ball-cv',
  imageBase64: frame.imageBase64,
  fieldImageCorners: state.fieldImageCorners
}));

const shadow = await projectShadow(
  buildShadowRequest(state.fieldPose, state.lightPose, state.objectPose)
);
```

Комментарий:

- frontend связывает поле, объект и свет в один pipeline;
- после захвата объекта запускается shadow endpoint;
- дальше тень обновляется уже в live-режиме.

### 2. Контракт shadow request

Файл:

- [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/request-builder.js)

Код:

```javascript
export function buildShadowRequest(fieldPose, lightPose, objectPose) {
  return {
    fieldPose,
    lightPose,
    objectPose
  };
}
```

Комментарий:

- backend получает три ключевые сущности;
- это делает `Task 4` независимым от конкретного detector-а;
- тень считается по унифицированным доменным данным.

### 3. Улучшенный backend shadow algorithm

Файл:

- [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py)

Код:

```python
distance_factor = _clamp(light_distance / 1.8, 0.75, 2.2)
stretch = min(3.4, 1.0 + (vertical_gap / angle_factor) * 0.85)
blur = _clamp(0.08 + vertical_gap * 0.22 + (distance_factor - 1.0) * 0.12, 0.06, 0.42)
penumbra_scale = _clamp(1.08 + vertical_gap * 0.55 + (distance_factor - 1.0) * 0.18, 1.05, 1.9)
occlusion_opacity = _clamp(0.55 + angle_factor * 0.18 - vertical_gap * 0.16, 0.32, 0.72)
reflection_opacity = _clamp(0.05 + (1.0 - angle_factor) * 0.12 + (light_pose["lightType"] == "ambient") * 0.08, 0.04, 0.22)
```

Комментарий:

- форма и размер тени зависят от расстояния до источника света;
- penumbra расширяется при удалении источника;
- добавлены отдельные параметры для окклюзии и рефлекса;
- это делает тень визуально богаче обычного чёрного пятна.

### 4. Контур тени

Файл:

- [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py)

Код:

```python
def _contour_ellipse(scale_x, scale_z, segments=16):
    contour = []
    for index in range(segments):
        angle = (index / segments) * 6.283185307179586
        contour.append({
            "x": round((scale_x * 0.5) * math.cos(angle), 4),
            "z": round((scale_z * 0.5) * math.sin(angle), 4),
        })
```

Комментарий:

- даже в упрощённом варианте backend возвращает контур тени;
- это даёт задел для дальнейшего перехода от plane-shadow к более сложной геометрии.

### 5. Визуализация umbra / penumbra / reflection

Файл:

- [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js)

Код:

```javascript
setFieldAlignedPlane(umbraPlane, shadowProjection.position, fieldPose.axes, shadowProjection.scale.x, shadowProjection.scale.z);
setFieldAlignedPlane(
  penumbraPlane,
  shadowProjection.position,
  fieldPose.axes,
  shadowProjection.scale.x * shadowProjection.penumbraScale,
  shadowProjection.scale.z * shadowProjection.penumbraScale
);
```

Комментарий:

- тень рисуется не одним слоем, а несколькими;
- основной слой отвечает за umbra;
- расширенный слой отвечает за penumbra;
- дополнительные слои дают ощущение окклюзии и рефлекса.

### 6. Выравнивание тени по плоскости поля

Файл:

- [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js)

Код:

```javascript
const basis = new THREE.Matrix4().makeBasis(right, forward, normal);
const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);
entity.object3D.quaternion.copy(quaternion);
```

Комментарий:

- тень ориентируется не в мировом горизонте, а по локальным осям поля;
- это позволяет учитывать наклон поверхности.

### 7. Live-обновление при движении света

Файл:

- [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js)

Код:

```javascript
if (state.objectCaptured && state.fieldPose.isValid && now - lastShadowTick > 180) {
  lastShadowTick = now;
  reprojectShadow().catch(() => {});
}
```

Комментарий:

- после захвата объекта тень автоматически обновляется;
- это даёт отклик на перемещение light marker и изменение сцены;
- реализован не только статичный режим, но и live response.

## Проверка покрытия решения

В README учтены основные части `Task 4`:

- отдельная страница задачи;
- live камера;
- поле по маркерам;
- light marker;
- объект внутри поля;
- shadow endpoint;
- реакция на перемещение света;
- зависимость размеров тени от расстояния;
- umbra;
- penumbra;
- окклюзия;
- рефлекс;
- ориентация тени по плоскости поля.

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

- `http://localhost:5174/task4.html`

## Что показывает это решение

- поле восстанавливается по маркерам;
- источник света задаётся отдельным маркером;
- объект определяется внутри поля;
- тень строится на поверхности поля;
- тень обновляется при движении света;
- в модели уже заложены простые элементы реалистичности.
