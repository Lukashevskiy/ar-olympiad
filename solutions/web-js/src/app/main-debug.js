import { mountScene } from './runtime.js';
import { createFakeMarkers } from '../debug/fake-markers.js';
import { createFakeLight } from '../debug/fake-light.js';
import { createFakeObject } from '../debug/fake-object.js';
import { createMarkerGizmos } from '../debug/marker-gizmos.js';
import { createFieldGizmos } from '../debug/field-gizmos.js';
import { createLightGizmos } from '../debug/light-gizmos.js';
import { createObjectGizmos } from '../debug/object-gizmos.js';
import { createShadowGizmos } from '../debug/shadow-gizmos.js';
import { createDebugGrid } from '../debug/debug-grid.js';

const container = document.getElementById('app');
const markers = createFakeMarkers();
const light = createFakeLight();
const objectProvider = createFakeObject();

mountScene({
  container,
  mode: 'debug',
  markersProvider: () => markers.getAll(),
  lightProvider: () => light.get(),
  objectProvider: () => objectProvider.get(),
  attachGizmos: ({ scene, fieldPose, lightPose, objectPose, shadowProjection }) => {
    createDebugGrid(scene);
    createMarkerGizmos(scene, markers.getAll());
    createFieldGizmos(scene, fieldPose);
    createLightGizmos(scene, lightPose);
    createObjectGizmos(scene, objectPose);
    createShadowGizmos(scene, lightPose, objectPose, shadowProjection);
  }
});
