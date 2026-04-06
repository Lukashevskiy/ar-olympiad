import { createFourMarkerSurface } from '../tasks/task1-field/four-marker-surface.js';
import { getSurfaceTransform } from '../tasks/task1-field/field-transform-service.js';
import { createDebugObjectProvider } from '../tasks/task2-object-detection/debug-object-provider.js';
import { createStubObjectDetector } from '../tasks/task2-object-detection/stub-object-detector.js';
import { createLightMarkerTracker } from '../tasks/task3-light/light-marker-tracker.js';
import { createShadowProjector } from '../tasks/task4-shadow/shadow-projector.js';
import { buildShadowGeometry } from '../tasks/task4-shadow/shadow-geometry.js';
import { buildShadowMaterial } from '../tasks/task4-shadow/shadow-style.js';
import { createDebugPanel } from '../ui/debug-panel.js';
import { createStatusOverlay } from '../ui/status-overlay.js';

function entity(tagName, attrs = {}) {
  const el = document.createElement(tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
}

function createSceneCamera({ position, rotation, active = true, interactive = false }) {
  return entity('a-camera', {
    active,
    position,
    rotation,
    'look-controls': `enabled: ${interactive}; pointerLockEnabled: false; touchEnabled: true; magicWindowTrackingEnabled: false`,
    'wasd-controls': `enabled: ${interactive}; acceleration: 18`
  });
}

function renderShadow(scene, objectPose, shadowProjection) {
  const shadow = entity('a-plane');
  scene.appendChild(shadow);
  updateShadow(shadow, objectPose, shadowProjection);
  return shadow;
}

function renderObject(scene, objectPose) {
  const object = entity('a-box');
  scene.appendChild(object);
  updateObject(object, objectPose);
  return object;
}

function updateObject(element, objectPose) {
  element.setAttribute('width', objectPose.size.x);
  element.setAttribute('height', objectPose.size.y);
  element.setAttribute('depth', objectPose.size.z);
  element.setAttribute('position', `${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}`);
  element.setAttribute('rotation', `${objectPose.rotation.x} ${objectPose.rotation.y} ${objectPose.rotation.z}`);
  element.setAttribute('material', 'color: #7ed957');
}

function updateShadow(element, objectPose, shadowProjection) {
  const geometry = buildShadowGeometry(objectPose, shadowProjection);
  const material = buildShadowMaterial(shadowProjection);
  element.setAttribute('width', geometry.width);
  element.setAttribute('height', geometry.height);
  element.setAttribute(
    'rotation',
    `${shadowProjection.rotation.x} ${shadowProjection.rotation.y} ${shadowProjection.rotation.z}`
  );
  element.setAttribute(
    'position',
    `${shadowProjection.position.x} ${shadowProjection.position.y} ${shadowProjection.position.z}`
  );
  element.setAttribute(
    'material',
    `color: ${material.color}; opacity: ${material.opacity}; transparent: true; side: double`
  );
}

function buildDebugState(mode, markers, fieldPose, shadowProjection) {
  return {
    mode,
    markerVisibility: Object.fromEntries(
      Object.entries(markers).map(([key, marker]) => [key, !!marker?.visible || mode === 'debug'])
    ),
    fieldValid: fieldPose.planeSolvable,
    projectionStatus: shadowProjection.status,
    errors: [
      ...fieldPose.validation.errors,
      ...fieldPose.validation.warnings,
      ...(shadowProjection.status === 'ok' ? [] : [shadowProjection.status])
    ],
    selectedEntity: 'object',
    toggles: {
      markerGizmos: true,
      fieldGizmos: true,
      lightGizmos: true,
      objectGizmos: true,
      shadowGizmos: true,
      debugGrid: mode === 'debug'
    }
  };
}

export function mountScene({
  container,
  mode,
  markersProvider,
  lightProvider,
  objectProvider,
  attachGizmos,
  initializeScene
}) {
  const scene = entity('a-scene', mode === 'ar'
    ? {
        embedded: true,
        vrModeUi: 'enabled: false',
        renderer: 'colorManagement: true',
        arjs: 'sourceType: webcam; debugUIEnabled: false;'
      }
    : {
        embedded: true,
        vrModeUi: 'enabled: false',
        renderer: 'colorManagement: true'
      });

  container.appendChild(scene);

  if (mode === 'debug') {
    scene.appendChild(entity('a-sky', { color: '#111827' }));
    scene.appendChild(createSceneCamera({
      position: '0 1.4 2.2',
      rotation: '-24 0 0',
      interactive: true
    }));
    scene.appendChild(entity('a-entity', { light: 'type: ambient; intensity: 0.8' }));
    scene.appendChild(entity('a-entity', { light: 'type: directional; intensity: 0.7', position: '1 2 1' }));
  } else {
    scene.appendChild(createSceneCamera({ position: '0 0 0', rotation: '0 0 0', interactive: false }));
  }

  const fieldSurface = createFourMarkerSurface({ getMarkers: () => markersProvider() });
  const lightTracker = createLightMarkerTracker({ getLightMarker: () => lightProvider() });
  const shadowProjector = createShadowProjector();
  const stubDetector = createStubObjectDetector();
  const fallbackObjectProvider = createDebugObjectProvider();
  const debugPanel = createDebugPanel(mode);
  const overlay = createStatusOverlay(mode);
  const sceneController = initializeScene?.({ scene }) || null;

  const bootstrapFieldPose = fieldSurface.evaluate();
  const bootstrapObjectPose = objectProvider ? objectProvider() : (mode === 'debug'
    ? fallbackObjectProvider.get()
    : stubDetector.detect({ fieldPose: bootstrapFieldPose }));
  const bootstrapShadowProjection = shadowProjector.project({
    fieldPose: bootstrapFieldPose,
    lightPose: lightTracker.evaluate(),
    objectPose: bootstrapObjectPose
  });
  const objectEntity = renderObject(scene, bootstrapObjectPose);
  const shadowEntity = renderShadow(scene, bootstrapObjectPose, bootstrapShadowProjection);

  let gizmosAttached = false;

  function computeFrame() {
    sceneController?.beforeFrame?.();

    const markers = markersProvider();
    const fieldPose = fieldSurface.evaluate();
    const lightPose = lightTracker.evaluate();
    const objectPose = objectProvider ? objectProvider() : (mode === 'debug'
      ? fallbackObjectProvider.get()
      : stubDetector.detect({ fieldPose }));
    const surfaceTransform = getSurfaceTransform(fieldPose, 0.5, 0.5);

    if (!objectProvider) {
      objectPose.position.x = surfaceTransform.position.x + 0.08;
      objectPose.position.z = surfaceTransform.position.z + 0.03;
      objectPose.position.y = Math.max(fieldPose.origin.y + objectPose.size.y * 0.5, objectPose.position.y);
    }

    const shadowProjection = shadowProjector.project({ fieldPose, lightPose, objectPose });
    const debugState = buildDebugState(mode, markers, fieldPose, shadowProjection);

    updateObject(objectEntity, objectPose);
    updateShadow(shadowEntity, objectPose, shadowProjection);

    debugPanel.render({ fieldPose, lightPose, objectPose, shadowProjection, debugState });
    const fieldStatus = fieldPose.planeSolvable
      ? `${fieldPose.status}${fieldPose.validation.warnings.length ? `: ${fieldPose.validation.warnings.join(', ')}` : ''}`
      : `plane-unreliable: ${fieldPose.validation.errors.join(', ') || 'unknown'}`;
    overlay.setMessage(`${fieldStatus} | shadow: ${shadowProjection.status}`);

    if (!gizmosAttached) {
      attachGizmos?.({ scene, fieldPose, lightPose, objectPose, shadowProjection, debugState });
      gizmosAttached = true;
    }

    return { scene, fieldPose, lightPose, objectPose, shadowProjection, debugState };
  }

  let latestState = {
    scene,
    fieldPose: bootstrapFieldPose,
    lightPose: lightTracker.evaluate(),
    objectPose: bootstrapObjectPose,
    shadowProjection: bootstrapShadowProjection,
    debugState: buildDebugState(mode, markersProvider(), bootstrapFieldPose, bootstrapShadowProjection)
  };

  const start = () => {
    latestState = computeFrame();
    if (mode === 'ar') {
      const tick = () => {
        latestState = computeFrame();
        window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    }
  };

  if (scene.hasLoaded) {
    start();
  } else {
    scene.addEventListener('loaded', start, { once: true });
  }

  return latestState;
}
