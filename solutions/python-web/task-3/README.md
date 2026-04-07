# Task 3 — Реализация источника света

## Назначение

Третья задача отвечает за выделение отдельного маркера источника света и преобразование его положения и ориентации в `LightPose`.

В этом решении реализованы три режима:

- рассеянный свет;
- направленный свет с фиксированным заранее направлением;
- направленный свет с учётом поворота маркера.

В качестве источника используется собственный маркер, который распознаётся через `AR.js`.

## Входной HTML

Основная страница решения:

- [task3.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html)

Полный HTML:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AR Olympiad | Task 3 Light Source</title>
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  </head>
  <body>
    <div id="app">
      <section id="controls-panel">
        <div id="controls-status"></div>
        <div id="controls-body"></div>
      </section>

      <div id="task3-layout">
        <section id="task3-stage">
          <div id="scene-summary"></div>
          <div id="scene-shell">
            <a-scene
              id="task3-scene"
              embedded
              vr-mode-ui="enabled: false"
              renderer="colorManagement: true"
              arjs="sourceType: webcam; debugUIEnabled: false;"
            >
              <a-camera active="true" position="0 0 0"></a-camera>
              <a-entity id="task3-ambient-light" light="type: ambient; intensity: 0.85"></a-entity>
              <a-entity id="task3-directional-light" light="type: directional; intensity: 0"></a-entity>
              <a-sphere id="task3-light-gizmo" visible="false"></a-sphere>
              <a-entity id="task3-light-ray" visible="false"></a-entity>
            </a-scene>
          </div>
        </section>

        <pre id="task3-json"></pre>
      </div>
    </div>
    <script type="module" src="/src/app/task3.js"></script>
  </body>
</html>
```

Что здесь важно:

- страница использует живую камеру;
- light marker читается в AR-сцене;
- на сцене есть реальные A-Frame light entities;
- поведение света меняется в зависимости от выбранного режима.

## Основные файлы решения

### Frontend

- [task3.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html)
- [task3.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task3.js)
- [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js)
- [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js)
- [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js)
- [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js)
- [task3-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-controls.js)
- [task3-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-view.js)
- [light-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-visualizer.js)

## Участки кода, которые отвечают за решение

### 1. Подключение камеры и AR.js

Файл:

- [task3.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html)

Код:

```html
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```

Комментарий:

- frontend запускает webcam pipeline;
- `AR.js` используется для распознавания маркера света;
- страница работает в live-режиме.

### 2. Подключение маркера света

Файл:

- [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js)

Код:

```javascript
export const LIGHT_MARKER_DEFINITION = {
  id: 'light-main',
  patternUrl: pattern5Url,
  size: 0.16
};
```

Комментарий:

- у источника света есть отдельный специальный маркер;
- используется собственный `.patt` файл;
- это соответствует условию задачи.

### 3. Чтение позы маркера света

Файл:

- [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js)

Код:

```javascript
return {
  position: { x: position.x, y: position.y + 0.35, z: position.z },
  direction: { x: forward.x, y: forward.y, z: forward.z },
  lightType: 'point',
  markerId: definition.id,
  confidence: 0.95
};
```

Комментарий:

- считывается мировая позиция маркера;
- считывается направление по ориентации маркера;
- это даёт основу для дальнейшего построения `LightPose`.

### 4. Формирование режимов света

Файл:

- [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js)

Код:

```javascript
export function buildLightPose(lightMarker, mode = 'ambient', intensity = 1) {
  const direction = mode === 'directional-marker'
    ? normalize(lightMarker.direction || FIXED_DIRECTION)
    : FIXED_DIRECTION;

  return {
    position: lightMarker.position,
    direction,
    lightType: mode === 'ambient' ? 'ambient' : 'directional',
    markerId: lightMarker.markerId || 'light-main',
    mode,
    visible: true,
    intensity,
    confidence: lightMarker.confidence ?? 0.95
  };
}
```

Комментарий:

- `ambient` реализует рассеянный свет;
- `directional-fixed` использует заранее выбранное направление;
- `directional-marker` использует направление, прочитанное из ориентации маркера.

### 5. Fallback состояния света

Файл:

- [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js)

Код:

```javascript
export function createLightPose() {
  return {
    position: { x: 0.3, y: 1.1, z: -0.2 },
    direction: { x: -0.1, y: -0.98, z: 0.1 },
    lightType: 'point',
    markerId: 'light-main',
    confidence: 0.92
  };
}
```

Комментарий:

- если маркер временно не виден, у системы остаётся базовое состояние света;
- это упрощает дальнейшую интеграцию с задачей тени.

### 6. Панель управления

Файл:

- [task3-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-controls.js)

Код:

```javascript
[
  { value: 'ambient', label: 'Ambient / diffuse' },
  { value: 'directional-fixed', label: 'Directional fixed' },
  { value: 'directional-marker', label: 'Directional by marker rotation' }
]
```

Комментарий:

- на странице можно переключать режимы света;
- можно менять интенсивность;
- это позволяет наглядно показать все три варианта реализации из условия.

### 7. Применение света в сцене

Файл:

- [light-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-visualizer.js)

Код:

```javascript
if (lightPose.lightType === 'ambient') {
  ambientLight.setAttribute('light', `type: ambient; intensity: ${lightPose.intensity}`);
  directionalLight.setAttribute('light', 'type: directional; intensity: 0');
  lightRay.setAttribute('visible', false);
  return;
}

ambientLight.setAttribute('light', 'type: ambient; intensity: 0.1');
directionalLight.setAttribute('light', `type: directional; intensity: ${lightPose.intensity}`);
setLookDirection(directionalLight, lightPose.position, lightPose.direction);
```

Комментарий:

- режим `ambient` включает рассеянный свет;
- режимы `directional-*` включают направленный свет;
- для направленного света учитывается либо фиксированное направление, либо ориентация маркера.

### 8. Главный live pipeline

Файл:

- [task3.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task3.js)

Код:

```javascript
const marker = source.refresh();
const lightPose = buildLightPose(marker || createLightPose(), controlsState.mode, controlsState.intensity);

updateLightVisualization(entities, lightPose);
view.render(lightDiagnostics(lightPose));
```

Комментарий:

- каждый кадр система обновляет позу light marker;
- затем формируется `LightPose`;
- после этого свет и визуализация синхронизируются со сценой.

## Проверка покрытия решения

В README учтены все основные части `Task 3`:

- отдельный light marker;
- живая камера и `AR.js`;
- чтение позиции маркера;
- чтение ориентации маркера;
- рассеянный свет;
- направленный свет с фиксированным направлением;
- направленный свет по повороту маркера;
- визуализация направления;
- UI-переключение режимов;
- численные параметры света.

## Как запустить

```bash
cd frontend
npm install
npm run dev
```

Открыть:

- `http://localhost:5174/task3.html`

## Что показывает это решение

- дополнительный маркер задаёт источник света;
- положение маркера задаёт позицию света;
- поворот маркера может задавать направление света;
- один и тот же marker pipeline поддерживает несколько режимов света;
- результат сразу виден в живой сцене.
