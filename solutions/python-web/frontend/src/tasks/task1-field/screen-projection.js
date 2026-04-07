export function projectWorldPointToImage(point, camera) {
  const THREE = window.THREE;
  const vector = new THREE.Vector3(point.x, point.y, point.z);
  vector.project(camera);

  return {
    x: Math.max(0, Math.min(1, (vector.x + 1) * 0.5)),
    y: Math.max(0, Math.min(1, (1 - vector.y) * 0.5)),
    z: vector.z
  };
}

export function projectFieldCornersToImage(fieldPose, camera) {
  if (!fieldPose?.corners?.length || !camera) {
    return null;
  }

  return fieldPose.corners.map((corner) => projectWorldPointToImage(corner, camera));
}
