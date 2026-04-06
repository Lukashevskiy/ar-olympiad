import { add, dot, normalize, scale, sub } from './plane.js';

export function rayPlaneIntersection(rayOrigin, rayDirection, planeOrigin, planeNormal) {
  const denom = dot(planeNormal, rayDirection);
  if (Math.abs(denom) < 1e-6) {
    return { ok: false, reason: 'parallel-ray' };
  }
  const t = dot(planeNormal, sub(planeOrigin, rayOrigin)) / denom;
  if (t < 0) {
    return { ok: false, reason: 'behind-ray-origin' };
  }
  return {
    ok: true,
    point: add(rayOrigin, scale(rayDirection, t)),
    distance: t
  };
}

export function projectShadow({ fieldPose, lightPose, objectPose }) {
  const objectPoint = {
    x: objectPose.position.x,
    y: objectPose.position.y - objectPose.size.y * 0.5,
    z: objectPose.position.z
  };

  let rayDirection;
  if (lightPose.lightType === 'directional' && lightPose.direction) {
    rayDirection = normalize({
      x: -lightPose.direction.x,
      y: -lightPose.direction.y,
      z: -lightPose.direction.z
    });
  } else {
    rayDirection = normalize(sub(objectPoint, lightPose.position));
  }

  const intersection = rayPlaneIntersection(
    lightPose.lightType === 'directional' ? objectPoint : lightPose.position,
    rayDirection,
    fieldPose.origin,
    fieldPose.normal
  );

  if (!intersection.ok) {
    return {
      position: objectPoint,
      rotation: { x: -90, y: objectPose.rotation?.y || 0, z: 0 },
      scale: { x: 0, y: 1, z: 0 },
      contour: [],
      opacity: 0.1,
      status: intersection.reason,
      confidence: 0.1
    };
  }

  const verticalGap = Math.max(0.05, objectPose.position.y - fieldPose.origin.y);
  const angleFactor = Math.max(0.3, Math.abs(rayDirection.y));
  const stretch = Math.min(3, 1 + verticalGap / angleFactor);
  return {
    position: { ...intersection.point, y: fieldPose.origin.y + 0.002 },
    rotation: { x: -90, y: objectPose.rotation?.y || 0, z: 0 },
    scale: {
      x: objectPose.size.x * stretch,
      y: 1,
      z: objectPose.size.z * (1 + stretch * 0.35)
    },
    contour: [],
    opacity: Math.max(0.2, Math.min(0.65, 0.7 - verticalGap * 0.4)),
    status: 'ok',
    confidence: Math.min(fieldPose.confidence, lightPose.confidence, objectPose.confidence)
  };
}
