import { detectObject, projectShadow } from '../api/client.js';
import { FIELD_MARKER_DEFINITIONS, LIGHT_MARKER_DEFINITION } from './marker-assets.js';
import { buildFieldPose } from '../tasks/task1-field/field-state.js';
import { createArFieldMarkerSource } from '../tasks/task1-field/ar-marker-source.js';
import { createMarkerPoseRegistry } from '../tasks/task1-field/marker-pose-registry.js';
import { projectFieldCornersToImage } from '../tasks/task1-field/screen-projection.js';
import { buildDetectionRequest } from '../tasks/task2-object-detection/request-builder.js';
import { captureCameraFrame } from '../tasks/task2-object-detection/camera-frame.js';
import { createArLightSource } from '../tasks/task3-light/ar-light-source.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';
import { buildLightPose } from '../tasks/task3-light/light-pose-service.js';
import { buildShadowRequest } from '../tasks/task4-shadow/request-builder.js';
import { createTask4Controls } from '../tasks/task4-shadow/task4-controls.js';
import { createTask4View } from '../tasks/task4-shadow/task4-view.js';
import { updateShadowVisualization } from '../tasks/task4-shadow/shadow-visualizer.js';

function createDefaultObjectPose() {
  return {
    className: 'ball',
    position: { x: 0, y: 0.1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    size: { x: 0.12, y: 0.12, z: 0.12 },
    confidence: 0,
    mask: { status: 'waiting' }
  };
}

function createDefaultShadowProjection() {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: -90, y: 0, z: 0 },
    scale: { x: 0.12, y: 1, z: 0.12 },
    contour: [],
    opacity: 0.2,
    blur: 0.0,
    penumbraScale: 1.0,
    reflectionOpacity: 0.0,
    occlusionOpacity: 0.0,
    status: 'waiting',
    confidence: 0
  };
}

async function start() {
  const root = document.getElementById('app');
  const scene = document.getElementById('task4-scene');
  const registry = createMarkerPoseRegistry();
  const fieldSource = createArFieldMarkerSource({
    scene,
    registry,
    definitions: FIELD_MARKER_DEFINITIONS
  });
  const lightSource = createArLightSource({
    scene,
    definition: LIGHT_MARKER_DEFINITION
  });
  const view = createTask4View(root);
  const controls = createTask4Controls(root, {
    onCapture: async () => captureObjectAndShadow(),
    onReproject: async () => reprojectShadow()
  });
  const entities = {
    objectProxy: document.getElementById('task4-object'),
    umbraPlane: document.getElementById('task4-umbra'),
    penumbraPlane: document.getElementById('task4-penumbra'),
    reflectionPlane: document.getElementById('task4-reflection'),
    occlusionPlane: document.getElementById('task4-occlusion'),
    lightRay: document.getElementById('task4-light-ray')
  };

  const state = {
    fieldPose: {
      ...buildFieldPose({}),
      visibleMarkers: []
    },
    lightPose: {
      ...buildLightPose(null, 'directional-marker', 1.0),
      position: createLightPose().position,
      direction: createLightPose().direction,
      markerId: 'light-main'
    },
    objectPose: createDefaultObjectPose(),
    shadowProjection: createDefaultShadowProjection(),
    previewUrl: '',
    fieldImageCorners: null,
    objectCaptured: false
  };

  let lastShadowTick = 0;

  function refreshTracking() {
    fieldSource.refresh();
    const lightMarker = lightSource.refresh();
    state.fieldPose = buildFieldPose(registry.getAll());
    const fallbackLight = createLightPose();
    state.lightPose = lightMarker
      ? buildLightPose(lightMarker, 'directional-marker', 1.0)
      : {
          ...buildLightPose(null, 'directional-marker', 1.0),
          position: fallbackLight.position,
          direction: fallbackLight.direction,
          markerId: fallbackLight.markerId
        };
    state.fieldImageCorners = scene.camera && state.fieldPose.corners.length
      ? projectFieldCornersToImage(state.fieldPose, scene.camera)
      : null;

    view.render({
      fieldPose: state.fieldPose,
      lightPose: state.lightPose,
      objectPose: state.objectPose,
      shadowProjection: state.shadowProjection,
      previewUrl: state.previewUrl,
      fieldImageCorners: state.fieldImageCorners,
      objectCaptured: state.objectCaptured
    });
  }

  async function captureObjectAndShadow() {
    refreshTracking();
    if (!state.fieldPose.isValid || !state.fieldImageCorners) {
      throw new Error('field-not-ready');
    }

    const frame = await captureCameraFrame();
    state.previewUrl = frame.imageBase64;
    const detection = await detectObject(buildDetectionRequest(state.fieldPose, {
      detectorMode: 'ball-cv',
      imageBase64: frame.imageBase64,
      fieldImageCorners: state.fieldImageCorners
    }));
    state.objectPose = detection.objectPose;
    state.objectCaptured = true;
    await reprojectShadow();
  }

  async function reprojectShadow() {
    refreshTracking();
    if (!state.objectCaptured) {
      throw new Error('object-not-captured');
    }

    const shadow = await projectShadow(
      buildShadowRequest(state.fieldPose, state.lightPose, state.objectPose)
    );
    state.shadowProjection = shadow.shadowProjection;
    updateShadowVisualization(entities, state.fieldPose, state.objectPose, state.shadowProjection);
    refreshTracking();
  }

  function tick(now) {
    refreshTracking();

    if (state.objectCaptured && state.fieldPose.isValid && now - lastShadowTick > 180) {
      lastShadowTick = now;
      reprojectShadow().catch(() => {});
    }

    if (state.fieldPose.isValid) {
      controls.setStatus(`Shadow live | field ${state.fieldPose.status} | light ${state.lightPose.visible ? 'tracked' : 'fallback'}`);
    } else {
      const reason = state.fieldPose.validation?.errors?.join(', ') || 'waiting for markers';
      controls.setStatus(`Field not ready: ${reason}`);
    }

    window.requestAnimationFrame(tick);
  }

  if (scene.hasLoaded) {
    window.requestAnimationFrame(tick);
  } else {
    scene.addEventListener('loaded', () => window.requestAnimationFrame(tick), { once: true });
  }
}

start();
