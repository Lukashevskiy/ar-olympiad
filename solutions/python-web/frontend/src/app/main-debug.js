import { detectObject, projectShadow } from '../api/client.js';
import { buildDetectionRequest } from '../tasks/task2-object-detection/request-builder.js';
import { buildShadowRequest } from '../tasks/task4-shadow/request-builder.js';
import { createDebugPayloads } from '../debug/mock-payloads.js';
import { createDebugView } from '../debug/debug-view.js';

async function start() {
  const root = document.getElementById('app');
  const view = createDebugView(root);
  const { fieldPose, lightPose } = createDebugPayloads();
  const detection = await detectObject(buildDetectionRequest(fieldPose));
  const shadow = await projectShadow(buildShadowRequest(fieldPose, lightPose, detection.objectPose));
  view.render({
    mode: 'debug',
    fieldPose,
    lightPose,
    objectPose: detection.objectPose,
    shadowProjection: shadow.shadowProjection,
    debugState: {
      mode: 'debug',
      markerVisibility: {
        'field-nw': true,
        'field-ne': true,
        'field-se': true,
        'field-sw': true,
        'light-main': true
      },
      fieldValid: fieldPose.isValid,
      projectionStatus: shadow.shadowProjection.status,
      errors: shadow.shadowProjection.status === 'ok' ? [] : [shadow.shadowProjection.status],
      selectedEntity: 'shadow',
      toggles: {
        fieldGizmos: true,
        lightGizmos: true,
        objectGizmos: true,
        shadowGizmos: true
      }
    }
  });
}

start();
