import { LIGHT_MARKER_DEFINITION } from './marker-assets.js';
import { createArLightSource } from '../tasks/task3-light/ar-light-source.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';
import { buildLightPose, lightDiagnostics } from '../tasks/task3-light/light-pose-service.js';
import { createTask3Controls } from '../tasks/task3-light/task3-controls.js';
import { createTask3View } from '../tasks/task3-light/task3-view.js';
import { updateLightVisualization } from '../tasks/task3-light/light-visualizer.js';

async function start() {
  const root = document.getElementById('app');
  const scene = document.getElementById('task3-scene');
  const source = createArLightSource({
    scene,
    definition: LIGHT_MARKER_DEFINITION
  });
  const controlsState = {
    mode: 'ambient',
    intensity: 0.85
  };
  const controls = createTask3Controls(root, controlsState, {
    onModeChange(next) {
      controlsState.mode = next;
    },
    onIntensityChange(next) {
      controlsState.intensity = next;
    }
  });
  const view = createTask3View(root);
  const entities = {
    ambientLight: document.getElementById('task3-ambient-light'),
    directionalLight: document.getElementById('task3-directional-light'),
    lightGizmo: document.getElementById('task3-light-gizmo'),
    lightRay: document.getElementById('task3-light-ray'),
    previewLabel: document.getElementById('task3-preview-label')
  };

  function refresh() {
    const marker = source.refresh();
    const fallbackPose = createLightPose();
    const lightPose = marker
      ? buildLightPose(marker, controlsState.mode, controlsState.intensity)
      : {
          ...buildLightPose(null, controlsState.mode, controlsState.intensity),
          position: fallbackPose.position,
          direction: fallbackPose.direction,
          markerId: fallbackPose.markerId
        };

    updateLightVisualization(entities, lightPose);
    view.render(lightDiagnostics(lightPose));

    if (lightPose.visible) {
      controls.setStatus(`${lightPose.mode} | confidence ${lightPose.confidence.toFixed(2)}`);
    } else {
      controls.setStatus('Waiting for light marker...');
    }
  }

  const tick = () => {
    refresh();
    window.requestAnimationFrame(tick);
  };

  if (scene.hasLoaded) {
    tick();
  } else {
    scene.addEventListener('loaded', tick, { once: true });
  }
}

start();
