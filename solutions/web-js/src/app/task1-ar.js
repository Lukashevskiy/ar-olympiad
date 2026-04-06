import { FIELD_MARKER_DEFINITIONS } from './marker-assets.js';
import { createDebugGrid } from '../debug/debug-grid.js';
import { createFieldGizmos } from '../debug/field-gizmos.js';
import { createMarkerGizmos } from '../debug/marker-gizmos.js';
import { createArFieldMarkerSource } from '../tasks/task1-field/ar-marker-source.js';
import { createMarkerPoseRegistry } from '../tasks/task1-field/marker-pose-registry.js';
import { mountTask1Scene } from '../tasks/task1-field/task1-runtime.js';

const container = document.getElementById('app');
const markerRegistry = createMarkerPoseRegistry();

mountTask1Scene({
  container,
  mode: 'ar',
  markersProvider: () => markerRegistry.getAll(),
  initializeScene: ({ scene }) => {
    const markerLayer = scene.querySelector('#task1-marker-layer') || scene;
    const fieldSource = createArFieldMarkerSource({
      scene,
      target: markerLayer,
      registry: markerRegistry,
      definitions: FIELD_MARKER_DEFINITIONS
    });

    return {
      beforeFrame() {
        fieldSource.refresh();
      }
    };
  },
  attachGizmos: ({ scene }) => {
    const markerLayer = scene.querySelector('#task1-marker-layer') || scene;
    const fieldLayer = scene.querySelector('#task1-field-layer') || scene;
    let markerRoot = null;
    let fieldRoot = null;

    return ({ fieldPose }) => {
      markerRoot?.remove();
      fieldRoot?.remove();
      markerRoot = createMarkerGizmos(markerLayer, markerRegistry.getAll());
      fieldRoot = createFieldGizmos(fieldLayer, fieldPose);
    };
  }
});
