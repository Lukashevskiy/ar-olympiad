import { createDebugGrid } from '../debug/debug-grid.js';
import { createFieldGizmosUpdater } from '../debug/field-gizmos.js';
import { createFakeMarkers } from '../debug/fake-markers.js';
import { createFakeObject } from '../debug/fake-object.js';
import { createMarkerGizmosUpdater } from '../debug/marker-gizmos.js';
import { createObjectGizmosUpdater } from '../debug/object-gizmos.js';
import { createTask2DebugControlsPanel } from '../tasks/task2-object-detection/task2-debug-controls-panel.js';
import { mountTask2Scene } from '../tasks/task2-object-detection/task2-runtime.js';

const container = document.getElementById('app');
const markers = createFakeMarkers();
const objectProvider = createFakeObject();

createTask2DebugControlsPanel(markers, objectProvider);

mountTask2Scene({
  container,
  markersProvider: () => markers.getAll(),
  objectProvider: () => objectProvider.get(),
  subscribeToChanges: (listener) => {
    const offMarkers = markers.subscribe(listener);
    const offObject = objectProvider.subscribe(listener);
    return () => {
      offMarkers?.();
      offObject?.();
    };
  },
  attachGizmos: ({ scene }) => {
    const gridLayer = scene.querySelector('#task2-grid-layer') || scene;
    const markerLayer = scene.querySelector('#task2-marker-layer') || scene;
    const fieldLayer = scene.querySelector('#task2-field-layer') || scene;
    const objectLayer = scene.querySelector('#task2-object-layer') || scene;

    createDebugGrid(gridLayer);
    const markerUpdater = createMarkerGizmosUpdater(markerLayer, Object.keys(markers.getAll()));
    const fieldUpdater = createFieldGizmosUpdater(fieldLayer);
    const objectUpdater = createObjectGizmosUpdater(objectLayer);

    return ({ fieldPose, objectPose }) => {
      markerUpdater.update(markers.getAll());
      fieldUpdater.update(fieldPose);
      objectUpdater.update(objectPose);
    };
  }
});
