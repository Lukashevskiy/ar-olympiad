function createMarkerEntity(definition) {
  const marker = document.createElement('a-marker');
  marker.setAttribute('type', 'pattern');
  marker.setAttribute('url', definition.patternUrl);
  marker.setAttribute('size', definition.size || 0.16);
  marker.dataset.markerId = definition.id;
  return marker;
}

function readPoseFromObject3D(object3D) {
  const THREE = window.THREE;
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const basisX = new THREE.Vector3(1, 0, 0);
  const basisY = new THREE.Vector3(0, 1, 0);
  const basisZ = new THREE.Vector3(0, 0, 1);

  object3D.updateMatrixWorld(true);
  object3D.matrixWorld.decompose(position, quaternion, scale);
  basisX.applyQuaternion(quaternion).normalize();
  basisY.applyQuaternion(quaternion).normalize();
  basisZ.applyQuaternion(quaternion).normalize();

  return {
    position: { x: position.x, y: position.y, z: position.z },
    axes: {
      right: { x: basisX.x, y: basisX.y, z: basisX.z },
      up: { x: basisY.x, y: basisY.y, z: basisY.z },
      forward: { x: basisZ.x, y: basisZ.y, z: basisZ.z }
    }
  };
}

export function createArFieldMarkerSource({ scene, registry, definitions }) {
  const markerEntities = definitions.map((definition) => {
    const markerEntity = createMarkerEntity(definition);
    scene.appendChild(markerEntity);
    return { definition, element: markerEntity };
  });

  return {
    refresh() {
      markerEntities.forEach(({ definition, element }) => {
        const visible = !!element.object3D.visible;
        if (!visible) {
          registry.update(definition.id, { visible: false, position: null, axes: null });
          return;
        }

        const pose = readPoseFromObject3D(element.object3D);
        registry.update(definition.id, {
          visible: true,
          position: pose.position,
          axes: pose.axes
        });
      });
    }
  };
}
