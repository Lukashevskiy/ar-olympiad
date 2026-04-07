import { detectObject, projectShadow } from '../api/client.js';
import { FIELD_MARKER_DEFINITIONS, LIGHT_MARKER_DEFINITION } from './marker-assets.js';
import { buildFieldPose } from '../tasks/task1-field/field-state.js';
import { createArFieldMarkerSource } from '../tasks/task1-field/ar-marker-source.js';
import { createMarkerPoseRegistry } from '../tasks/task1-field/marker-pose-registry.js';
import { projectFieldCornersToImage } from '../tasks/task1-field/screen-projection.js';
import { buildDetectionRequest } from '../tasks/task2-object-detection/request-builder.js';
import { captureCameraFrame } from '../tasks/task2-object-detection/camera-frame.js';
import { createTask2Controls } from '../tasks/task2-object-detection/task2-controls.js';
import { createTask2View } from '../tasks/task2-object-detection/task2-view.js';
import { createArLightSource } from '../tasks/task3-light/ar-light-source.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';
import { buildShadowRequest } from '../tasks/task4-shadow/request-builder.js';

function updateObjectProxy(entity, objectPose) {
  const radius = Math.max(objectPose.size.x, objectPose.size.y, objectPose.size.z) * 0.5;
  entity.setAttribute('radius', Math.max(0.02, radius));
  entity.setAttribute('position', `${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}`);
  entity.setAttribute('visible', true);
}

function updateShadowProxy(entity, shadowProjection) {
  entity.setAttribute('width', Math.max(0.04, shadowProjection.scale.x));
  entity.setAttribute('height', Math.max(0.04, shadowProjection.scale.z));
  entity.setAttribute(
    'position',
    `${shadowProjection.position.x} ${shadowProjection.position.y} ${shadowProjection.position.z}`
  );
  entity.setAttribute(
    'rotation',
    `${shadowProjection.rotation.x} ${shadowProjection.rotation.y} ${shadowProjection.rotation.z}`
  );
  entity.setAttribute('material', `color: #111111; opacity: ${shadowProjection.opacity}; transparent: true; side: double`);
  entity.setAttribute('visible', true);
}

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
    opacity: 0.2,
    status: 'waiting',
    confidence: 0
  };
}

async function start() {
  const root = document.getElementById('app');
  const scene = document.getElementById('ar-scene');
  const objectProxy = document.getElementById('task2-object');
  const shadowProxy = document.getElementById('task2-shadow');
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
  const controls = createTask2Controls(root, {
    async onDetect() {
      await runDetection();
    }
  });
  const view = createTask2View(root);
  const state = {
    fieldPose: {
      ...buildFieldPose({}),
      visibleMarkers: []
    },
    lightPose: createLightPose(),
    objectPose: createDefaultObjectPose(),
    shadowProjection: createDefaultShadowProjection(),
    previewUrl: '',
    fieldImageCorners: null,
    detectionStatus: 'waiting'
  };

  function refreshTracking() {
    fieldSource.refresh();
    const lightMarker = lightSource.refresh();
    state.fieldPose = buildFieldPose(registry.getAll());
    state.lightPose = lightMarker || createLightPose();
    state.fieldImageCorners = scene.camera && state.fieldPose.corners.length
      ? projectFieldCornersToImage(state.fieldPose, scene.camera)
      : null;

    if (state.fieldPose.isValid) {
      controls.setStatus(`Field ready | confidence ${state.fieldPose.confidence.toFixed(2)}`);
    } else {
      const reason = state.fieldPose.validation?.errors?.join(', ') || 'waiting for markers';
      controls.setStatus(`Field not ready: ${reason}`);
    }

    view.render({
      mode: 'task2-live',
      fieldPose: state.fieldPose,
      lightPose: state.lightPose,
      objectPose: state.objectPose,
      shadowProjection: state.shadowProjection,
      previewUrl: state.previewUrl,
      fieldImageCorners: state.fieldImageCorners,
      detectionStatus: state.detectionStatus
    });
  }

  async function runDetection() {
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
    const shadow = await projectShadow(
      buildShadowRequest(state.fieldPose, state.lightPose, detection.objectPose)
    );

    state.objectPose = detection.objectPose;
    state.shadowProjection = shadow.shadowProjection;
    state.detectionStatus = detection.objectPose.mask?.status || 'detected';

    updateObjectProxy(objectProxy, state.objectPose);
    updateShadowProxy(shadowProxy, state.shadowProjection);
    refreshTracking();
  }

  const startLoop = () => {
    const tick = () => {
      refreshTracking();
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  if (scene.hasLoaded) {
    startLoop();
  } else {
    scene.addEventListener('loaded', startLoop, { once: true });
  }
}

start();
