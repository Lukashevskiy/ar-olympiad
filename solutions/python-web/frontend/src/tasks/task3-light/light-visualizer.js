function setObjectPosition(entity, point) {
  entity.object3D.position.set(point.x, point.y, point.z);
}

function setLookDirection(entity, origin, direction) {
  const THREE = window.THREE;
  const target = new THREE.Vector3(
    origin.x + direction.x,
    origin.y + direction.y,
    origin.z + direction.z
  );
  entity.object3D.position.set(origin.x, origin.y, origin.z);
  entity.object3D.lookAt(target);
}

export function updateLightVisualization(entities, lightPose) {
  const {
    ambientLight,
    directionalLight,
    lightGizmo,
    lightRay,
    previewLabel
  } = entities;

  if (!lightPose.visible) {
    ambientLight.setAttribute('light', 'type: ambient; intensity: 0');
    directionalLight.setAttribute('light', 'type: directional; intensity: 0');
    lightGizmo.setAttribute('visible', false);
    lightRay.setAttribute('visible', false);
    previewLabel.setAttribute('value', 'Light marker not visible');
    return;
  }

  lightGizmo.setAttribute('visible', true);
  setObjectPosition(lightGizmo, lightPose.position);

  if (lightPose.lightType === 'ambient') {
    ambientLight.setAttribute('light', `type: ambient; intensity: ${lightPose.intensity}`);
    directionalLight.setAttribute('light', 'type: directional; intensity: 0');
    lightRay.setAttribute('visible', false);
    previewLabel.setAttribute('value', 'Ambient light from marker');
    return;
  }

  ambientLight.setAttribute('light', 'type: ambient; intensity: 0.1');
  directionalLight.setAttribute('light', `type: directional; intensity: ${lightPose.intensity}`);
  setLookDirection(directionalLight, lightPose.position, lightPose.direction);
  setLookDirection(lightRay, lightPose.position, lightPose.direction);
  lightRay.setAttribute('visible', true);
  lightRay.setAttribute('line', 'start: 0 0 0; end: 0 0 -0.45; color: #ffd166');
  previewLabel.setAttribute(
    'value',
    lightPose.mode === 'directional-fixed' ? 'Directional light with fixed direction' : 'Directional light by marker rotation'
  );
}
