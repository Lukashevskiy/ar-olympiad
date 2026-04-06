export function createShadowGizmos(scene, lightPose, objectPose, shadowProjection) {
  const root = document.createElement('a-entity');

  const ray = document.createElement('a-entity');
  ray.setAttribute(
    'line',
    `start: ${lightPose.position.x} ${lightPose.position.y} ${lightPose.position.z}; end: ${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}; color: #ff8c42`
  );
  root.appendChild(ray);

  const projectedRay = document.createElement('a-entity');
  projectedRay.setAttribute(
    'line',
    `start: ${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}; end: ${shadowProjection.position.x} ${shadowProjection.position.y + 0.01} ${shadowProjection.position.z}; color: #8b5cf6`
  );
  root.appendChild(projectedRay);

  const point = document.createElement('a-sphere');
  point.setAttribute('radius', '0.02');
  point.setAttribute('color', '#8b5cf6');
  point.setAttribute('position', `${shadowProjection.position.x} ${shadowProjection.position.y + 0.01} ${shadowProjection.position.z}`);
  root.appendChild(point);
  scene.appendChild(root);
  return root;
}
