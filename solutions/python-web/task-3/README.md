# Task 3 — Реализация источника света

## Назначение

Третья задача отвечает за выделение отдельного маркера источника света и за преобразование его положения и ориентации в `LightPose`, который затем можно использовать в задаче тени. В этой реализации использован собственный marker pattern, распознаваемый через `AR.js`, а поверх него реализованы три режима работы света: рассеянный свет, направленный свет с заранее фиксированным направлением и направленный свет с учётом поворота самого маркера.

Важно, что эта задача здесь оформлена не как вспомогательная утилита, а как самостоятельная live-страница. Пользователь видит реальную сцену, может показать marker в камеру, переключить режим света и сразу наблюдать, как меняется освещение preview-объектов.

## Входной HTML

Основная страница решения находится в [task3.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html). Как и в предыдущих задачах, HTML здесь играет роль явного каркаса: он поднимает AR-сцену, создаёт реальные light entities и задаёт места для панели управления и численной диагностики.

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

Из этого HTML уже видно, что страница ориентирована не только на распознавание marker pose, но и на визуальное объяснение результата: в сцене заранее присутствуют ambient и directional источники, а также сущности для отображения положения и направления света.

## Основные файлы решения

Вся логика `Task 3` проходит через [task3.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task3.js), где собирается live pipeline страницы. Паттерн маркера задаётся в [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js), pose маркера считывается через [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js), fallback-состояние хранится в [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js), а доменная логика режимов сосредоточена в [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js). Управление страницей и численная диагностика распределены между [task3-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-controls.js), [task3-view.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-view.js) и [light-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-visualizer.js).

## Участки кода, которые отвечают за решение

### 1. Подключение камеры и AR.js

Как и в других live-задачах, всё начинается с подключения `A-Frame` и `AR.js`. Это находится прямо в [task3.html](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/task3.html).

```html
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```

Эта часть важна не сама по себе, а тем, что через неё страница получает живой видеопоток и возможность отслеживать отдельный marker источника света в реальном времени.

### 2. Подключение маркера света

Сам marker описан в [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/marker-assets.js) и задаёт отдельную доменную сущность `light-main`.

```javascript
export const LIGHT_MARKER_DEFINITION = {
  id: 'light-main',
  patternUrl: pattern5Url,
  size: 0.16
};
```

Важная идея здесь та же, что и в первой задаче: конкретный паттерн и доменное имя света разделены, поэтому marker можно менять, не трогая остальную логику формирования `LightPose`.

### 3. Чтение позы маркера света

Реальное считывание позы происходит в [ar-light-source.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/ar-light-source.js).

```javascript
return {
  position: { x: position.x, y: position.y + 0.35, z: position.z },
  direction: { x: forward.x, y: forward.y, z: forward.z },
  lightType: 'point',
  markerId: definition.id,
  confidence: 0.95
};
```

Здесь уже появляется ключевой для третьей задачи момент: система читает не только положение маркера, но и направление его forward-вектора. Это создаёт задел для режима, где поворот marker-а влияет на направление света.

### 4. Формирование режимов света

Смысловое преобразование сырых данных marker-а в `LightPose` сосредоточено в [light-pose-service.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-pose-service.js).

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

Это один из центральных фрагментов третьей задачи. В нём видно, что одна и та же marker pose может быть интерпретирована тремя способами: как рассеянный свет, как направленный свет с фиксированной ориентацией или как направленный свет, ориентированный самим marker-ом. Благодаря этому код получается компактным, а логика режимов — прозрачной.

### 5. Fallback состояния света

Для устойчивости live pipeline у страницы есть базовое fallback-состояние в [light-state.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-state.js).

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

Это означает, что даже при временной потере маркера страница не распадается на пустое состояние. Вместо этого у неё остаётся понятная опорная конфигурация света, которая позже пригодится и для четвёртой задачи.

### 6. Панель управления

Управление режимами реализовано в [task3-controls.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/task3-controls.js). Здесь пользователь может переключать модель света и менять интенсивность без необходимости менять сам marker pipeline.

```javascript
[
  { value: 'ambient', label: 'Ambient / diffuse' },
  { value: 'directional-fixed', label: 'Directional fixed' },
  { value: 'directional-marker', label: 'Directional by marker rotation' }
]
```

Этот фрагмент ценен не только как UI-деталь. Он подчёркивает, что страница задумана как демонстрация сразу нескольких допустимых по условию вариантов реализации источника света.

### 7. Применение света в сцене

Перевод `LightPose` в реальное освещение A-Frame происходит в [light-visualizer.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/tasks/task3-light/light-visualizer.js).

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

Здесь хорошо видно, как абстрактный `LightPose` превращается в конкретное поведение сцены. В одном случае страница включает рассеянное освещение, в другом — направленный источник, а визуализация луча помогает увидеть, откуда именно сейчас “светит” marker.

### 8. Главный live pipeline

Все предыдущие части собираются вместе в [task3.js](/home/dmitriyl/olypiad_ar_task/solutions/python-web/frontend/src/app/task3.js).

```javascript
const marker = source.refresh();
const lightPose = buildLightPose(marker || createLightPose(), controlsState.mode, controlsState.intensity);

updateLightVisualization(entities, lightPose);
view.render(lightDiagnostics(lightPose));
```

Логика здесь проста и показательна: каждый кадр страница обновляет позу marker-а, строит из неё доменный `LightPose`, применяет этот pose к реальным световым сущностям и одновременно выводит всю численную диагностику на экран. Именно поэтому третья задача читается как цельный live guide по работе со светом, а не как набор разрозненных экспериментов.

## Проверка покрытия решения

В этом README последовательно описаны все основные части `Task 3`: отдельный light marker, живая камера через `AR.js`, чтение позиции и ориентации маркера, рассеянный свет, направленный свет с фиксированным направлением, направленный свет по повороту маркера, визуализация направления света, управление режимами через UI и численные параметры света в панели состояния.

## Как запустить

```bash
cd frontend
npm install
npm run dev
```

Открыть:

- `http://localhost:5174/task3.html`
