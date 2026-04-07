import { createStatusOverlay } from '../../ui/status-overlay.js';
import { createFourMarkerSurface } from '../task1-field/four-marker-surface.js';
import { resolveObjectPoseOnField } from './object-pose-service.js';
import { createTask2DebugStatePanel } from './task2-debug-state-panel.js';

export function mountTask2Scene({
  container,
  markersProvider,
  objectProvider,
  attachGizmos,
  subscribeToChanges
}) {
  const scene = container.querySelector('#task2-scene, a-scene');
  if (!scene) {
    throw new Error('Task 2 scene root was not found in HTML');
  }

  const fieldSurface = createFourMarkerSurface({ getMarkers: () => markersProvider() });
  const statePanel = createTask2DebugStatePanel();
  const overlay = createStatusOverlay('task2-debug');

  let gizmoUpdater = null;

  function computeFrame() {
    const fieldPose = fieldSurface.evaluate();
    const objectDetection = objectProvider();
    const objectPose = resolveObjectPoseOnField({
      fieldPose,
      detection: objectDetection
    });

    statePanel.render({ fieldPose, objectPose });

    const statusMessage = fieldPose.planeSolvable
      ? `${fieldPose.status} | object ${objectPose.fieldStatus} | uv ${objectPose.surfaceUv.u.toFixed(2)},${objectPose.surfaceUv.v.toFixed(2)}`
      : `plane-unreliable: ${fieldPose.validation.errors.join(', ') || 'unknown'}`;
    overlay.setMessage(statusMessage);

    if (!gizmoUpdater && attachGizmos) {
      gizmoUpdater = attachGizmos({ scene, fieldPose, objectPose }) || null;
    }
    gizmoUpdater?.({ scene, fieldPose, objectPose });

    return { scene, fieldPose, objectPose };
  }

  const start = () => {
    computeFrame();
    subscribeToChanges?.(() => {
      computeFrame();
    });
  };

  if (scene.hasLoaded) {
    start();
  } else {
    scene.addEventListener('loaded', start, { once: true });
  }
}
