import { createDebugGrid } from '../debug/debug-grid.js';
import { createFieldGizmosUpdater } from '../debug/field-gizmos.js';
import { createFakeMarkers } from '../debug/fake-markers.js';
import { createMarkerGizmosUpdater } from '../debug/marker-gizmos.js';
import { createTask1DebugControls } from '../tasks/task1-field/task1-debug-controls.js';
import { mountTask1Scene } from '../tasks/task1-field/task1-runtime.js';

const container = document.getElementById('app');
const markers = createFakeMarkers();
createTask1DebugControls(markers);

mountTask1Scene({
  container,
  mode: 'debug',
  markersProvider: () => markers.getAll(),
  subscribeToChanges: (listener) => markers.subscribe(listener),
  attachGizmos: ({ scene }) => {
    const gridLayer = scene.querySelector('#task1-grid-layer') || scene;
    const markerLayer = scene.querySelector('#task1-marker-layer') || scene;
    const fieldLayer = scene.querySelector('#task1-field-layer') || scene;

    createDebugGrid(gridLayer);
    const markerUpdater = createMarkerGizmosUpdater(markerLayer, Object.keys(markers.getAll()));
    const fieldUpdater = createFieldGizmosUpdater(fieldLayer);

    return ({ fieldPose }) => {
      markerUpdater.update(markers.getAll());
      fieldUpdater.update(fieldPose);
    };
  }
});
