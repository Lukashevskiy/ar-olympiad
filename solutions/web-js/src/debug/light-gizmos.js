export function createLightGizmos(scene, lightPose) {
  const root = document.createElement('a-entity');
  const sphere = document.createElement('a-sphere');
  sphere.setAttribute('radius', '0.04');
  sphere.setAttribute('color', '#ffd166');
  sphere.setAttribute('position', `${lightPose.position.x} ${lightPose.position.y} ${lightPose.position.z}`);
  root.appendChild(sphere);

  const ray = document.createElement('a-entity');
  ray.setAttribute(
    'line',
    `start: ${lightPose.position.x} ${lightPose.position.y} ${lightPose.position.z}; end: ${lightPose.position.x + lightPose.direction.x * 0.5} ${lightPose.position.y + lightPose.direction.y * 0.5} ${lightPose.position.z + lightPose.direction.z * 0.5}; color: #ffd166`
  );
  root.appendChild(ray);
  scene.appendChild(root);
  return root;
}
