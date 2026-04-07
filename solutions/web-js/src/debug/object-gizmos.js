function applyObjectPose(root, box, anchor, link, objectPose) {
  root.object3D.visible = !!objectPose;
  if (!objectPose) {
    return;
  }

  box.setAttribute('position', `${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}`);
  box.setAttribute('rotation', `${objectPose.rotation.x} ${objectPose.rotation.y} ${objectPose.rotation.z}`);
  box.setAttribute('depth', objectPose.size.z);
  box.setAttribute('height', objectPose.size.y);
  box.setAttribute('width', objectPose.size.x);
  box.setAttribute('material', 'color: #7ed957; opacity: 0.75');

  if (objectPose.fieldAnchor) {
    anchor.object3D.visible = true;
    link.object3D.visible = true;
    anchor.setAttribute(
      'position',
      `${objectPose.fieldAnchor.x} ${objectPose.fieldAnchor.y} ${objectPose.fieldAnchor.z}`
    );
    anchor.setAttribute('radius', 0.02);
    anchor.setAttribute('material', 'color: #facc15; opacity: 0.95');
    link.setAttribute(
      'line',
      `start: ${objectPose.fieldAnchor.x} ${objectPose.fieldAnchor.y} ${objectPose.fieldAnchor.z}; end: ${objectPose.position.x} ${objectPose.position.y} ${objectPose.position.z}; color: #facc15`
    );
  } else {
    anchor.object3D.visible = false;
    link.object3D.visible = false;
  }
}

export function createObjectGizmosUpdater(target) {
  const root = document.createElement('a-entity');
  const box = document.createElement('a-box');
  const anchor = document.createElement('a-sphere');
  const link = document.createElement('a-entity');

  root.append(anchor, link, box);
  target.appendChild(root);

  return {
    update(objectPose) {
      applyObjectPose(root, box, anchor, link, objectPose);
    },
    root
  };
}

export function createObjectGizmos(scene, objectPose) {
  const updater = createObjectGizmosUpdater(scene);
  updater.update(objectPose);
  return updater.root;
}
