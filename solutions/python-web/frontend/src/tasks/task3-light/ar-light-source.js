function createLightMarkerEntity(definition) {
  const marker = document.createElement('a-marker');
  marker.setAttribute('type', 'pattern');
  marker.setAttribute('url', definition.patternUrl);
  marker.setAttribute('size', definition.size || 0.16);
  marker.dataset.markerId = definition.id;

  const proxy = document.createElement('a-cone');
  proxy.setAttribute('radius-bottom', '0.03');
  proxy.setAttribute('radius-top', '0.006');
  proxy.setAttribute('height', '0.12');
  proxy.setAttribute('position', '0 0.06 0');
  proxy.setAttribute('rotation', '0 0 90');
  proxy.setAttribute('color', '#ffd166');
  marker.appendChild(proxy);

  return marker;
}

function readLightPose(object3D, definition) {
  const THREE = window.THREE;
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, -1);

  object3D.updateMatrixWorld(true);
  object3D.matrixWorld.decompose(position, quaternion, scale);
  forward.applyQuaternion(quaternion).normalize();

  return {
    position: { x: position.x, y: position.y + 0.35, z: position.z },
    direction: { x: forward.x, y: forward.y, z: forward.z },
    lightType: 'point',
    markerId: definition.id,
    confidence: 0.95
  };
}

export function createArLightSource({ scene, definition }) {
  const markerEntity = createLightMarkerEntity(definition);
  scene.appendChild(markerEntity);

  return {
    refresh() {
      if (!markerEntity.object3D.visible) {
        return null;
      }
      return readLightPose(markerEntity.object3D, definition);
    }
  };
}
