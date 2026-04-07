# Task 1 — Построение поля по маркерам

## Назначение

Первая задача отвечает за восстановление поля по маркерам и за вычисление геометрии поверхности, на которую затем будут опираться все остальные части проекта. В этой реализации поле задаётся четырьмя маркерами, где каждый маркер соответствует одному углу: `field-nw`, `field-ne`, `field-se` и `field-sw`. Система получает из AR-сцены мировые позиции и локальные оси этих маркеров, отбрасывает отсутствующие данные, реконструирует поверхность поля, вычисляет её локальные оси и нормаль, а затем собирает итоговый `FieldPose`.

С точки зрения постановки это решение соответствует варианту с четырьмя собственными маркерами и с построением поверхности с учётом наклона и искривления. Плоский случай здесь не вынесен в отдельный режим, потому что он естественно получается как частный случай той же модели, когда все нормали и углы согласованы и не создают заметного изгиба.

## Используемые маркеры

Привязка маркеров вынесена в [marker-assets.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/app/marker-assets.js). Это важный организационный момент: замена паттернов не требует переписывать математику поля или AR-слой, достаточно сменить mapping между конкретным `.patt` файлом и доменным идентификатором угла.

```js
export const FIELD_MARKER_DEFINITIONS = [
  { id: 'field-nw', patternUrl: pattern1Url, label: 'Pattern 1', size: 0.16 },
  { id: 'field-ne', patternUrl: pattern2Url, label: 'Pattern 2', size: 0.16 },
  { id: 'field-se', patternUrl: pattern3Url, label: 'Pattern 3', size: 0.16 },
  { id: 'field-sw', patternUrl: pattern4Url, label: 'Pattern 4', size: 0.16 }
];
```

Здесь видно, что каждый угол поля связан со своим marker pattern. Благодаря этому слой распознавания остаётся техническим, а доменная модель поля продолжает работать уже с именованными углами, а не с безличными паттернами.

## Входной HTML

Основная страница задачи находится в [task1.html](/home/dmitriyl/olypiad_ar_task/solutions/web-js/task1.html). Важный момент этой страницы в том, что статические части сцены вынесены в HTML, а не создаются в рантайме. Это упрощает структуру решения: из HTML сразу видно, где находится камера, где будет жить слой маркеров и где будет размещаться визуализация поля.

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

Именно эта страница поднимает live camera pipeline через `AR.js`, а дальше передаёт управление в `task1-ar.js`, где начинается доменная логика первой задачи.

## Основные файлы решения

Ключевая связка файлов в первой задаче проходит через [task1-ar.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/app/task1-ar.js), [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/ar-marker-source.js), [marker-pose-registry.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/marker-pose-registry.js), [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js), [surface-reconstruction.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/surface-reconstruction.js) и [field-transform-service.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-transform-service.js). В сумме эти файлы образуют понятную цепочку: сначала берётся pose маркеров, потом из него собирается поверхность поля, затем поле валидируется и превращается в `FieldPose`, после чего от этой поверхности можно получать локальный transform в любой точке.

## Участки кода, которые отвечают за решение

### 1. Получение позы маркера

Источник фактических данных о маркере находится в [ar-marker-source.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/ar-marker-source.js). Здесь AR.js и A-Frame используются только как поставщики мирового transform, а доменная модель поля строится уже поверх этих данных.

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

Ключевая идея этого фрагмента в том, что система берёт не только координаты центра маркера, но и его локальные оси. Для простой плоской реконструкции хватило бы только позиций углов, но здесь оси нужны, чтобы учитывать наклон и дальше использовать нормали маркеров как часть модели поверхности.

### 2. Исключение отсутствующих маркеров из решения

Следующий шаг происходит в [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js), где система сначала выясняет, какие углы вообще доступны в текущем кадре. Это важно не только для качества, но и для устойчивости: задача не должна молча строить поле по неполным данным.

```js
const visibleMarkers = MARKER_ORDER.filter(
  (markerId) => markerMap[markerId]?.visible && markerMap[markerId]?.position
);

const corners = MARKER_ORDER.map((markerId) => (
  markerMap[markerId]?.visible ? markerMap[markerId]?.position : null
));
```

В этом месте решение явно разделяет два состояния: “поле можно восстанавливать” и “данных пока недостаточно”. Это избавляет от ложной геометрии в тех кадрах, где часть маркеров потеряна или распознана нестабильно.

### 3. Построение поверхности по положениям и нормалям маркеров

Собственно реконструкция поверхности вынесена в [surface-reconstruction.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/surface-reconstruction.js). Здесь поле представляется не как жёсткая идеальная плоскость, а как normal-guided patch, который проходит через четыре угла и дополнительно подстраивается под нормали маркеров.

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

Смысл здесь в том, что позиции углов дают базовую геометрию, а нормали маркеров корректируют форму поверхности. Поэтому решение умеет вести себя не только как “прямоугольник на столе”, но и как модель поля на наклонённой или слегка искажённой поверхности.

### 4. Получение центральной геометрии поля

После того как поверхность появилась, система извлекает из неё центральную геометрию. Это тоже происходит в [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js), но уже на уровне доменного объекта `FieldPose`.

```js
const surface = createNormalGuidedSurface(markerMap);
const centerSample = surface.sample(0.5, 0.5);
const centerU = surface.sample(0.52, 0.5);
const centerV = surface.sample(0.5, 0.52);
const centerRight = normalize(sub(centerU.position, centerSample.position));
const centerForward = normalize(sub(centerV.position, centerSample.position));
const centerNormal = normalize(cross(centerRight, centerForward));
```

Здесь поле уже рассматривается как локальная система координат. Центральная точка становится `origin`, соседние сэмплы задают касательные направления, а из них получается нормаль. Это нужно не только для отчёта о состоянии поля, но и для всех следующих задач, потому что объект, свет и тень должны работать в одной согласованной системе координат поверхности.

Итогом становится `FieldPose`, где одновременно присутствуют и доменные размеры поля, и локальные оси, и ссылка на модель самой поверхности:

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

### 5. Проверка качества реконструкции

Отдельно важно, что решение не просто строит поле, но и оценивает, насколько хорошо оно восстановлено. Это также собранно в [field-validator.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-validator.js), где геометрические ошибки и расхождения нормалей превращаются в итоговый статус.

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

Это важный инженерный момент: первая задача не сводится к “плоскость либо есть, либо нет”. В реальном потоке данных возможны искажения, шум и неоднозначные кадры, поэтому система должна уметь различать хороший случай, искажённый, но рабочий случай, и полностью ненадёжную реконструкцию. За это и отвечает связка `layout-good`, `layout-distorted` и `plane-unreliable`.

### 6. Получение transform в любой точке поверхности

Завершающий элемент первой задачи находится в [field-transform-service.js](/home/dmitriyl/olypiad_ar_task/solutions/web-js/src/tasks/task1-field/field-transform-service.js). Здесь поле уже используется как параметризованная поверхность, в любой точке которой можно получить локальный transform.

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

Практически это означает, что последующие задачи могут не “угадывать”, где находится поверхность, а спрашивать у `Task 1`, как выглядит локальная ориентация в точке `(u, v)`. Именно поэтому первая задача становится фундаментом для размещения объекта на поле, для привязки любой графики к поверхности и для построения тени уже на восстановленном поле, а не на условной мировой плоскости.

## Запуск

```bash
cd /home/dmitriyl/olypiad_ar_task/solutions/web-js
npm install
npm run dev
```

Открыть:

- `http://localhost:5173/task1.html`
