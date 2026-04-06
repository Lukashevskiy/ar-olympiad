export function createObjectGizmos(scene, objectPose) {
  const root = document.createElement('a-entity');
  const box = document.createElement('a-box');
  box.setAttribute('position', `${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}`);
  box.setAttribute('rotation', `${objectPose.rotation.x} ${objectPose.rotation.y} ${objectPose.rotation.z}`);
  box.setAttribute('depth', objectPose.size.z);
  box.setAttribute('height', objectPose.size.y);
  box.setAttribute('width', objectPose.size.x);
  box.setAttribute('material', 'color: #7ed957; opacity: 0.75');
  root.appendChild(box);
  scene.appendChild(root);
  return root;
}
