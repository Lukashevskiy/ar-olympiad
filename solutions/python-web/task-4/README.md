# Task 4 — Построение тени на поле

## Назначение

Четвёртая задача отвечает за построение тени объекта на поверхности поля с учётом геометрии поля, положения и типа источника света, а также формы и положения самого объекта. В этой реализации тень строится не как одно плоское пятно, а как более выразительная многослойная модель, где отдельно учитываются основное ядро тени, более мягкая penumbra, локальная окклюзия под объектом и слабый рефлекс на поверхности.

С инженерной точки зрения эта задача собирает в единый pipeline почти всё, что было сделано раньше. Сначала по четырём маркерам восстанавливается поле. Затем по отдельному marker-у восстанавливается источник света. После этого внутри поля определяется объект, backend строит `ShadowProjection`, а frontend отображает этот результат прямо в живой AR-сцене и периодически перепроецирует тень при перемещении источника света.

## Входной HTML

Основная страница решения находится в [task4.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task4.html). Её структура показывает важную мысль четвёртой задачи: тень здесь не является побочным эффектом, а выступает отдельным визуальным объектом, для которого в сцене заранее подготовлено несколько самостоятельных слоёв.

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

Уже на уровне HTML видно, что здесь есть не только объект и итоговая тень, но и отдельные сущности для нескольких визуальных компонентов shadow model. Это и создаёт ощущение более реалистичного результата.

## Основные файлы решения

Главный live pipeline собран в [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js). Визуальная часть вынесена в [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js), управление страницей находится в [task4-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/task4-controls.js), а диагностическое отображение состояния — в [task4-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/task4-view.js). Контракт shadow request описан в [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/request-builder.js).

При этом сама четвёртая задача в этой реализации не живёт в изоляции: она опирается на [field-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/field-state.js), [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/ar-marker-source.js), [screen-projection.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task1-field/screen-projection.js), [camera-frame.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/camera-frame.js), [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task2-object-detection/request-builder.js), [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js) и [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js). На backend за задачу отвечают [shadow.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/api/shadow.py), [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py), [models.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/domain/models.py) и [ball_detector.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/cv/ball_detector.py).

## Участки кода, которые отвечают за решение

### 1. Главный live pipeline

В [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js) поле, свет и объект связываются в единую цепочку. Сначала frontend детектирует объект внутри поля, а затем по этому объекту и текущему источнику света запрашивает shadow projection.

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

Этот фрагмент хорошо показывает смысл задачи: тень не рисуется “по месту”, а вычисляется как результат согласованного взаимодействия между `Task 1`, `Task 2` и `Task 3`.

### 2. Контракт shadow request

Чтобы четвёртая задача не зависела от конкретного detector-а или конкретной страницы, frontend собирает запрос через [request-builder.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/request-builder.js).

```javascript
export function buildShadowRequest(fieldPose, lightPose, objectPose) {
  return {
    fieldPose,
    lightPose,
    objectPose
  };
}
```

Смысл этого контракта в том, что backend получает уже готовые доменные сущности. Для него не важно, как именно был найден объект или откуда пришёл свет — важны только поле, источник и объект как согласованные части одной сцены.

### 3. Усиленный backend shadow algorithm

Самая важная логика живёт в [shadow_math.py](/home/dmitriyl/olypiad_ar_task/solutions/python-web/backend/app/services/shadow_math.py). Именно здесь простая проекция тени была расширена до модели, которая хотя бы в базовом виде учитывает реалистичность.

```python
distance_factor = _clamp(light_distance / 1.8, 0.75, 2.2)
stretch = min(3.4, 1.0 + (vertical_gap / angle_factor) * 0.85)
blur = _clamp(0.08 + vertical_gap * 0.22 + (distance_factor - 1.0) * 0.12, 0.06, 0.42)
penumbra_scale = _clamp(1.08 + vertical_gap * 0.55 + (distance_factor - 1.0) * 0.18, 1.05, 1.9)
occlusion_opacity = _clamp(0.55 + angle_factor * 0.18 - vertical_gap * 0.16, 0.32, 0.72)
reflection_opacity = _clamp(0.05 + (1.0 - angle_factor) * 0.12 + (light_pose["lightType"] == "ambient") * 0.08, 0.04, 0.22)
```

Этот кусок кода важен тем, что здесь тень перестаёт быть просто растянутым чёрным прямоугольником. Размер ядра, мягкость penumbra, насыщенность окклюзии и сила рефлекса зависят от расстояния до света, угла луча и конфигурации сцены.

### 4. Контур тени

Для более содержательной модели backend дополнительно возвращает контур тени. Это по-прежнему упрощённая геометрия, но она уже годится как база для дальнейшего усложнения.

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

Даже в таком виде contour полезен: он показывает, что тень рассматривается как отдельная геометрическая сущность, а не только как набор opacity и scale.

### 5. Визуализация umbra, penumbra и дополнительных слоёв

На frontend итоговый shadow result раскладывается на несколько визуальных слоёв в [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js).

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

Здесь особенно важно, что тень не сводится к одному plane. Отдельный слой отвечает за основное ядро, отдельный — за penumbra, ещё один — за плотную локальную окклюзию прямо под объектом, и отдельный слой имитирует слабый рефлекс от поверхности. Именно эта многослойность делает итоговую картинку визуально убедительнее.

### 6. Выравнивание тени по плоскости поля

Тень должна лежать не просто на мировой плоскости, а на восстановленной поверхности поля. Для этого в [shadow-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task4-shadow/shadow-visualizer.js) строится quaternion по локальным осям поля.

```javascript
const basis = new THREE.Matrix4().makeBasis(right, forward, normal);
const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);
entity.object3D.quaternion.copy(quaternion);
```

Это важный момент четвёртой задачи: если поле наклонено, тень должна лечь именно на этот наклон, а не оставаться в условном мировом горизонте.

### 7. Live-обновление при движении света

В [task4.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task4.js) после захвата объекта тень начинает автоматически перепроецироваться при движении источника света.

```javascript
if (state.objectCaptured && state.fieldPose.isValid && now - lastShadowTick > 180) {
  lastShadowTick = now;
  reprojectShadow().catch(() => {});
}
```

Этот фрагмент показывает, что задача не ограничена обработкой статичного кадра. После того как объект определён, light marker можно двигать, и система будет давать на это достаточно быстрый визуальный отклик.

## Проверка покрытия решения

Этот README последовательно описывает все ключевые части `Task 4`: отдельный HTML entrypoint, live camera pipeline, поле по маркерам, источник света по marker-у, объект внутри поля, backend shadow endpoint, реакцию тени на движение света, зависимость размеров тени от расстояния до источника, разделение на umbra и penumbra, локальную окклюзию, слабый рефлекс и ориентацию тени по плоскости поля.

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
