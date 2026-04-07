import { add, scale } from '../../math/plane.js';
import { getSurfaceTransform } from '../task1-field/field-transform-service.js';

function clamp01(value, fallback = 0.5) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}

function normalizeDetection(detection = {}) {
  return {
    className: detection.className || 'unknown-object',
    size: detection.size || { x: 0.16, y: 0.16, z: 0.16 },
    rotation: detection.rotation || { x: 0, y: 0, z: 0 },
    contour: detection.contour || [],
    mask: detection.mask || null,
    confidence: detection.confidence ?? 0,
    surfaceUv: {
      u: clamp01(detection.surfaceUv?.u, 0.5),
      v: clamp01(detection.surfaceUv?.v, 0.5)
    },
    heightAboveField: Number.isFinite(detection.heightAboveField)
      ? detection.heightAboveField
      : ((detection.size?.y || 0.16) * 0.5),
    source: detection.source || 'unknown'
  };
}

export function resolveObjectPoseOnField({ fieldPose, detection }) {
  const normalized = normalizeDetection(detection);
  const surfaceTransform = getSurfaceTransform(
    fieldPose,
    normalized.surfaceUv.u,
    normalized.surfaceUv.v
  );
  const anchor = surfaceTransform.position || fieldPose.origin;
  const normal = surfaceTransform.axes?.up || fieldPose.axes.up;
  const position = add(anchor, scale(normal, normalized.heightAboveField));

  return {
    className: normalized.className,
    position,
    rotation: normalized.rotation,
    size: normalized.size,
    contour: normalized.contour,
    mask: normalized.mask,
    confidence: normalized.confidence,
    surfaceUv: normalized.surfaceUv,
    heightAboveField: normalized.heightAboveField,
    fieldAnchor: anchor,
    fieldStatus: fieldPose.planeSolvable ? 'attached-to-field' : 'field-unreliable',
    source: normalized.source
  };
}
