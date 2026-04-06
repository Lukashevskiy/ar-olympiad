export function buildShadowGeometry(objectPose, shadowProjection) {
  return {
    primitive: 'plane',
    width: Math.max(0.01, shadowProjection.scale.x || objectPose.size.x),
    height: Math.max(0.01, shadowProjection.scale.z || objectPose.size.z)
  };
}
