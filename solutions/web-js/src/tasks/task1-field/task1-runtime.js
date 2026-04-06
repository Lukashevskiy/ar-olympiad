import { createFourMarkerSurface } from './four-marker-surface.js';
import { createTask1Panel } from './task1-panel.js';
import { createStatusOverlay } from '../../ui/status-overlay.js';

export function mountTask1Scene({
  container,
  mode,
  markersProvider,
  initializeScene,
  attachGizmos,
  subscribeToChanges
}) {
  const scene = container.querySelector('#task1-scene, a-scene');
  if (!scene) {
    throw new Error('Task 1 scene root was not found in HTML');
  }

  const fieldSurface = createFourMarkerSurface({ getMarkers: () => markersProvider() });
  const panel = createTask1Panel(mode);
  const overlay = createStatusOverlay(mode);
  const sceneController = initializeScene?.({ scene }) || null;

  let gizmoUpdater = null;

  function computeFrame() {
    sceneController?.beforeFrame?.();
    const fieldPose = fieldSurface.evaluate();
    panel.render(fieldPose);
    const fieldStatus = fieldPose.planeSolvable
      ? `${fieldPose.status}${fieldPose.validation.warnings.length ? `: ${fieldPose.validation.warnings.join(', ')}` : ''}`
      : `plane-unreliable: ${fieldPose.validation.errors.join(', ') || 'unknown'}`;
    overlay.setMessage(fieldStatus);

    if (!gizmoUpdater && attachGizmos) {
      gizmoUpdater = attachGizmos({ scene, fieldPose }) || null;
    }
    gizmoUpdater?.({ scene, fieldPose });
    sceneController?.afterFrame?.({ scene, fieldPose });

    if (!gizmoUpdater && attachGizmos) {
      attachGizmos({ scene, fieldPose });
    }

    return { scene, fieldPose };
  }

  let latestState = { scene, fieldPose: null };

  const start = () => {
    latestState = computeFrame();
    if (mode === 'ar') {
      const tick = () => {
        latestState = computeFrame();
        window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    } else {
      subscribeToChanges?.(() => {
        latestState = computeFrame();
      });
    }
  };

  if (scene.hasLoaded) {
    start();
  } else {
    scene.addEventListener('loaded', start, { once: true });
  }

  return latestState;
}
