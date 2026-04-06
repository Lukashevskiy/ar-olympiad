import { mountScene } from './runtime.js';
import { FIELD_MARKER_DEFINITIONS, LIGHT_MARKER_DEFINITION } from './marker-assets.js';
import { createMarkerPoseRegistry } from '../tasks/task1-field/marker-pose-registry.js';
import { createArFieldMarkerSource } from '../tasks/task1-field/ar-marker-source.js';
import { createArLightMarkerSource } from '../tasks/task3-light/ar-light-marker-source.js';

const container = document.getElementById('app');
const markerRegistry = createMarkerPoseRegistry();
let latestLightState = null;

mountScene({
  container,
  mode: 'ar',
  markersProvider: () => markerRegistry.getAll(),
  lightProvider: () => latestLightState,
  initializeScene: ({ scene }) => {
    const fieldSource = createArFieldMarkerSource({
      scene,
      registry: markerRegistry,
      definitions: FIELD_MARKER_DEFINITIONS
    });
    const lightSource = createArLightMarkerSource({
      scene,
      definition: LIGHT_MARKER_DEFINITION
    });

    return {
      beforeFrame() {
        fieldSource.refresh();
        latestLightState = lightSource.refresh();
      }
    };
  }
});
