# Task 1 — Построение поля по маркерам

## Назначение

Решение `Task 1` отвечает за восстановление поля по маркерам и вычисление геометрии поверхности.

В текущем варианте используется схема с **четырьмя маркерами поля**, где каждый маркер задает один угол:

- `field-nw`
- `field-ne`
- `field-se`
- `field-sw`

По этим маркерам система:

1. получает мировые позиции и локальные оси маркеров;
2. определяет видимые маркеры;
3. строит поверхность поля;
4. вычисляет локальные оси поля и нормаль;
5. формирует `FieldPose`;
6. оценивает качество реконструкции.

## Соответствие пунктам задания

Формулировка задания для первой части включает:

- два маркера для противоположных углов;
- четыре маркера для всех сторон;
- barcode или собственные маркеры;
- построение поля:
  - без учета наклона;
  - с учетом наклона и искривления поверхности.

В данном решении реализован вариант:

- **четыре маркера для всех сторон**;
- **собственные маркеры** в виде изображения + `.patt`;
- **построение поверхности с учетом наклона и искривления**.

Плоский случай без искривления является частным случаем этой же модели.

## Используемые маркеры

Привязка маркеров хранится в файле:

- [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/app/marker-assets.js)

Код:

```js
export const FIELD_MARKER_DEFINITIONS = [
  { id: 'field-nw', patternUrl: pattern1Url, label: 'Pattern 1', size: 0.16 },
  { id: 'field-ne', patternUrl: pattern2Url, label: 'Pattern 2', size: 0.16 },
  { id: 'field-se', patternUrl: pattern3Url, label: 'Pattern 3', size: 0.16 },
  { id: 'field-sw', patternUrl: pattern4Url, label: 'Pattern 4', size: 0.16 }
];
```

Что здесь происходит:

- каждому углу поля сопоставляется свой pattern marker;
- `patternUrl` указывает на `.patt` файл;
- при замене маркеров меняется только этот mapping.

## Входной HTML

Исходный HTML-файл для `Task 1`:

- [task1.html](/home/dmitriyl/olypiad_ar_task/solutions/web-js/task1.html)

Код:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AR Olympiad | Task 1 Field AR Demo</title>
    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
    <style>
      body { margin: 0; font-family: monospace; background: #10141a; color: #e7edf3; }
      #app { position: fixed; inset: 0; }
    </style>
  </head>
  <body>
    <div id="app">
      <a-scene
        id="task1-scene"
        embedded
        vr-mode-ui="enabled: false"
        renderer="colorManagement: true"
        arjs="sourceType: webcam; debugUIEnabled: false;"
      >
        <a-camera id="task1-camera" position="0 0 0" rotation="0 0 0"></a-camera>
        <a-entity id="task1-marker-layer"></a-entity>
        <a-entity id="task1-field-layer"></a-entity>
      </a-scene>
    </div>
    <script type="module" src="/src/app/task1-ar.js"></script>
  </body>
</html>
```

Что здесь важно:

- `a-scene` задает AR-сцену;
- `arjs="sourceType: webcam"` включает работу через камеру;
- `task1-marker-layer` используется для marker entities;
- `task1-field-layer` используется для визуализации поля;
- основная логика запускается из `task1-ar.js`.

## Основные файлы решения

- [task1-ar.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/app/task1-ar.js)
- [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/ar-marker-source.js)
- [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/marker-pose-registry.js)
- [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js)
- [surface-reconstruction.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/surface-reconstruction.js)
- [field-transform-service.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-transform-service.js)

## Участки кода, которые отвечают за решение

### 1. Получение позы маркера

Файл:

- [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/ar-marker-source.js)

Код:

```js
function readPoseFromObject3D(object3D) {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const basisX = new THREE.Vector3(1, 0, 0);
  const basisY = new THREE.Vector3(0, 1, 0);
  const basisZ = new THREE.Vector3(0, 0, 1);

  object3D.updateMatrixWorld(true);
  object3D.matrixWorld.decompose(position, quaternion, scale);
  basisX.applyQuaternion(quaternion).normalize();
  basisY.applyQuaternion(quaternion).normalize();
  basisZ.applyQuaternion(quaternion).normalize();

  return {
    position: { x: position.x, y: position.y, z: position.z },
    axes: {
      right: { x: basisX.x, y: basisX.y, z: basisX.z },
      up: { x: basisY.x, y: basisY.y, z: basisY.z },
      forward: { x: basisZ.x, y: basisZ.y, z: basisZ.z }
    }
  };
}
```

Комментарий:

- из AR.js / A-Frame берётся мировая поза маркера;
- получаются позиция и локальные оси;
- эти данные идут дальше в реконструкцию поля.

### 2. Исключение отсутствующих маркеров из решения

Файл:

- [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js)

Код:

```js
const visibleMarkers = MARKER_ORDER.filter(
  (markerId) => markerMap[markerId]?.visible && markerMap[markerId]?.position
);

const corners = MARKER_ORDER.map((markerId) => (
  markerMap[markerId]?.visible ? markerMap[markerId]?.position : null
));
```

Комментарий:

- в реконструкции участвуют только видимые маркеры;
- если угла нет, поле считается неполным;

### 3. Построение поверхности по положениям и нормалям маркеров

Файл:

- [surface-reconstruction.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/surface-reconstruction.js)

Код:

```js
export function createNormalGuidedSurface(markerMap) {
  const cornerData = buildCornerData(markerMap);
  const cornerNormals = Object.values(cornerData).map((corner) => corner.normal);
  const referenceNormal = normalize(average(cornerNormals));

  return {
    type: 'normal-guided-patch',
    sample(u, v) {
      const basePoint = bilerp(corners[0], corners[1], corners[2], corners[3], clampedU, clampedV);
      const point = projectToTangentBlend(basePoint, referenceNormal, cornerData, weights);
      const normal = normalize(average([
        scale(cornerData.nw.normal, weights.nw),
        scale(cornerData.ne.normal, weights.ne),
        scale(cornerData.se.normal, weights.se),
        scale(cornerData.sw.normal, weights.sw)
      ]));

      return {
        position: point,
        normal
      };
    }
  };
}
```

Комментарий:

- поле строится не как одна жесткая плоскость;
- используется патч по четырем углам;
- нормали маркеров влияют на форму поверхности;
- это и есть реализация варианта “с учетом наклона и искривления поверхности”.

### 4. Получение центральной геометрии поля

Файл:

- [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js)

Код:

```js
const surface = createNormalGuidedSurface(markerMap);
const centerSample = surface.sample(0.5, 0.5);
const centerU = surface.sample(0.52, 0.5);
const centerV = surface.sample(0.5, 0.52);
const centerRight = normalize(sub(centerU.position, centerSample.position));
const centerForward = normalize(sub(centerV.position, centerSample.position));
const centerNormal = normalize(cross(centerRight, centerForward));
```

Комментарий:

- сначала строится поверхность;
- затем берётся центральная точка;
- по соседним точкам вычисляются касательные;
- из них вычисляется нормаль поля.

Итоговый `FieldPose`:

```js
return {
  origin: centerSample.position,
  axes: {
    right: centerRight,
    up: centerNormal,
    forward: centerForward
  },
  normal: centerNormal,
  surface,
  width: validation.width,
  depth: validation.depth,
  ...
};
```

Комментарий:

- `origin` — центральная опорная точка поля;
- `axes` — локальная система координат поля;
- `normal` — нормаль поля;
- `surface` — модель поверхности;
- `width` и `depth` — размеры поля.

### 5. Проверка качества реконструкции

Файл:

- [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js)

Код:

```js
const mergedValidation = {
  ...validation,
  markerNormalAlignmentDeg: normalValidation.averageAlignmentDeg,
  markerNormalMaxDeviationDeg: normalValidation.maxAlignmentDeg,
  averageMarkerNormal: normalValidation.averageNormal,
  warnings: mergedWarnings,
  errors: mergedErrors,
  reasons: [...mergedErrors, ...mergedWarnings],
  planeSolvable: mergedErrors.length === 0,
  layoutQuality: mergedWarnings.length === 0 ? 'good' : 'distorted',
  status: mergedErrors.length
    ? 'plane-unreliable'
    : mergedWarnings.length
      ? 'layout-distorted'
      : 'layout-good'
};
```

Комментарий:

- оценивается геометрия углов;
- оценивается согласованность нормалей маркеров;
- формируется итоговый статус поля.

Смысл статусов:

- `layout-good` — поле восстановлено уверенно;
- `layout-distorted` — поле восстановлено, но геометрия искажена;
- `plane-unreliable` — данные противоречат друг другу или их недостаточно.

### 6. Получение transform в любой точке поверхности

Файл:

- [field-transform-service.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-transform-service.js)

Код:

```js
const sample = fieldPose.surface.sample(u, v);
const duPrev = fieldPose.surface.sample(u0, v);
const duNext = fieldPose.surface.sample(u1, v);
const dvPrev = fieldPose.surface.sample(u, v0);
const dvNext = fieldPose.surface.sample(u, v1);
const tangentU = normalize(sub(duNext.position, duPrev.position));
const tangentV = normalize(sub(dvNext.position, dvPrev.position));
const normal = normalize(cross(tangentU, tangentV));
```

Комментарий:

- по параметрам `u, v` берётся точка на поверхности;
- вычисляются касательные направления;
- получается локальная нормаль и локальная ориентация поверхности.

Это нужно для следующих задач:

- размещение объекта на поле;
- привязка графики к поверхности;
- построение тени уже на восстановленном поле.

## Запуск

```bash
cd /home/dmitriyl/olypiad_ar_task/solutions/web-js
npm install
npm run dev
```

Открыть:

- `http://localhost:5173/task1.html`
