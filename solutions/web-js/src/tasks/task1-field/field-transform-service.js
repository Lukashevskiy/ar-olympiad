import { cross, normalize, sub } from '../../math/plane.js';

export function getSurfaceTransform(fieldPose, u = 0.5, v = 0.5) {
  if (!fieldPose.surface?.sample) {
    return {
      position: fieldPose.origin,
      rotation: { x: 0, y: 0, z: 0 },
      axes: fieldPose.axes
    };
  }

  const sample = fieldPose.surface.sample(u, v);
  const delta = 0.02;
  const u0 = Math.max(0, u - delta);
  const u1 = Math.min(1, u + delta);
  const v0 = Math.max(0, v - delta);
  const v1 = Math.min(1, v + delta);
  const duPrev = fieldPose.surface.sample(u0, v);
  const duNext = fieldPose.surface.sample(u1, v);
  const dvPrev = fieldPose.surface.sample(u, v0);
  const dvNext = fieldPose.surface.sample(u, v1);
  const tangentU = normalize(sub(duNext.position, duPrev.position));
  const tangentV = normalize(sub(dvNext.position, dvPrev.position));
  const normal = normalize(cross(tangentU, tangentV));

  return {
    position: sample.position,
    rotation: { x: 0, y: 0, z: 0 },
    axes: {
      right: tangentU,
      up: normal,
      forward: tangentV
    },
    uv: { u, v },
    isOnSurface: fieldPose.isValid,
    normal: sample.normal
  };
}
