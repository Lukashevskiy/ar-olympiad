function setFieldAlignedPlane(entity, position, fieldAxes, width, depth) {
  const THREE = window.THREE;
  const right = new THREE.Vector3(fieldAxes.right.x, fieldAxes.right.y, fieldAxes.right.z).normalize();
  const forward = new THREE.Vector3(fieldAxes.forward.x, fieldAxes.forward.y, fieldAxes.forward.z).normalize();
  const normal = new THREE.Vector3(fieldAxes.up.x, fieldAxes.up.y, fieldAxes.up.z).normalize();
  const basis = new THREE.Matrix4().makeBasis(right, forward, normal);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(basis);

  entity.object3D.position.set(position.x, position.y, position.z);
  entity.object3D.quaternion.copy(quaternion);
  entity.object3D.scale.set(Math.max(0.001, width), Math.max(0.001, depth), 1);
}

export function updateShadowVisualization(entities, fieldPose, objectPose, shadowProjection) {
  const {
    objectProxy,
    umbraPlane,
    penumbraPlane,
    reflectionPlane,
    occlusionPlane,
    lightRay
  } = entities;

  objectProxy.object3D.position.set(objectPose.position.x, objectPose.position.y, objectPose.position.z);
  objectProxy.object3D.scale.set(objectPose.size.x, objectPose.size.y, objectPose.size.z);
  objectProxy.setAttribute('visible', true);

  if (shadowProjection.status !== 'ok') {
    [umbraPlane, penumbraPlane, reflectionPlane, occlusionPlane, lightRay].forEach((entity) => {
      entity.setAttribute('visible', false);
    });
    return;
  }

  setFieldAlignedPlane(
    umbraPlane,
    shadowProjection.position,
    fieldPose.axes,
    shadowProjection.scale.x,
    shadowProjection.scale.z
  );
  umbraPlane.setAttribute('material', `color: #050505; opacity: ${shadowProjection.opacity}; transparent: true; side: double`);
  umbraPlane.setAttribute('visible', true);

  setFieldAlignedPlane(
    penumbraPlane,
    shadowProjection.position,
    fieldPose.axes,
    shadowProjection.scale.x * shadowProjection.penumbraScale,
    shadowProjection.scale.z * shadowProjection.penumbraScale
  );
  penumbraPlane.setAttribute(
    'material',
    `color: #171717; opacity: ${Math.max(0.08, shadowProjection.opacity * 0.42)}; transparent: true; side: double`
  );
  penumbraPlane.setAttribute('visible', true);

  setFieldAlignedPlane(
    occlusionPlane,
    {
      x: shadowProjection.position.x,
      y: shadowProjection.position.y + 0.0006,
      z: shadowProjection.position.z
    },
    fieldPose.axes,
    shadowProjection.scale.x * 0.68,
    shadowProjection.scale.z * 0.68
  );
  occlusionPlane.setAttribute(
    'material',
    `color: #000000; opacity: ${shadowProjection.occlusionOpacity}; transparent: true; side: double`
  );
  occlusionPlane.setAttribute('visible', true);

  setFieldAlignedPlane(
    reflectionPlane,
    {
      x: shadowProjection.position.x,
      y: shadowProjection.position.y + 0.0012,
      z: shadowProjection.position.z
    },
    fieldPose.axes,
    shadowProjection.scale.x * 1.12,
    shadowProjection.scale.z * 1.12
  );
  reflectionPlane.setAttribute(
    'material',
    `color: #d6efff; opacity: ${shadowProjection.reflectionOpacity}; transparent: true; side: double`
  );
  reflectionPlane.setAttribute('visible', true);

  const rayStart = `${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}`;
  const rayEnd = `${shadowProjection.position.x} ${shadowProjection.position.y} ${shadowProjection.position.z}`;
  lightRay.setAttribute('line', `start: ${rayStart}; end: ${rayEnd}; color: #ffd166`);
  lightRay.setAttribute('visible', true);
}
