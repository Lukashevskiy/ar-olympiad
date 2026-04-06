import { cross, normalize, sub } from '../../math/plane.js';
import { computeConfidence, markerNormal, validateMarkerNormals, validateRectangle } from '../../math/validation.js';
import { createNormalGuidedSurface } from './surface-reconstruction.js';

const MARKER_ORDER = ['field-nw', 'field-ne', 'field-se', 'field-sw'];

function defaultFieldPose(reason = 'missing-markers') {
  return {
    origin: { x: 0, y: 0, z: 0 },
    corners: [],
    axes: {
      right: { x: 1, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      forward: { x: 0, y: 0, z: 1 }
    },
    normal: { x: 0, y: 1, z: 0 },
    width: 0,
    depth: 0,
    isValid: false,
    status: 'insufficient-markers',
    planeSolvable: false,
    layoutQuality: 'unknown',
    confidence: 0,
    visibleMarkers: [],
    missingMarkers: MARKER_ORDER,
    markerDiagnostics: [],
    validation: {
      rectangularityError: 1,
      fourthCornerError: 1,
      diagonalError: 1,
      orthogonalityErrorDeg: 90,
      cornerAngleDeg: 0,
      aspectRatio: 0,
      markerNormalAlignmentDeg: 90,
      markerNormalMaxDeviationDeg: 90,
      averageMarkerNormal: { x: 0, y: 1, z: 0 },
      warnings: [],
      errors: [reason],
      reasons: [reason],
      planeSolvable: false,
      layoutQuality: 'unknown',
      status: 'insufficient-markers',
      expectedCorners: {
        se: { x: 0, y: 0, z: 0 },
        sw: { x: 0, y: 0, z: 0 }
      },
      distances: {
        widthTop: 0,
        widthBottom: 0,
        depthLeft: 0,
        depthRight: 0,
        diagonalA: 0,
        diagonalB: 0
      }
    }
  };
}

export function buildFieldPose(markerMap) {
  const visibleMarkers = MARKER_ORDER.filter(
    (markerId) => markerMap[markerId]?.visible && markerMap[markerId]?.position
  );
  const missingMarkers = MARKER_ORDER.filter(
    (markerId) => !(markerMap[markerId]?.visible && markerMap[markerId]?.position)
  );
  const corners = MARKER_ORDER.map((markerId) => (
    markerMap[markerId]?.visible ? markerMap[markerId]?.position : null
  ));

  if (corners.some((corner) => !corner)) {
    const fallback = defaultFieldPose();
    fallback.visibleMarkers = visibleMarkers;
    fallback.missingMarkers = missingMarkers;
    fallback.markerDiagnostics = MARKER_ORDER.map((markerId) => ({
      id: markerId,
      visible: !!markerMap[markerId]?.visible,
      position: markerMap[markerId]?.position || null,
      axes: markerMap[markerId]?.axes || null,
      rotation: markerMap[markerId]?.rotation || null
    }));
    return fallback;
  }

  const validation = validateRectangle(corners);
  const surface = createNormalGuidedSurface(markerMap);
  const centerSample = surface.sample(0.5, 0.5);
  const centerU = surface.sample(0.52, 0.5);
  const centerV = surface.sample(0.5, 0.52);
  const centerRight = normalize(sub(centerU.position, centerSample.position));
  const centerForward = normalize(sub(centerV.position, centerSample.position));
  const centerNormal = normalize(cross(centerRight, centerForward));
  const normalValidation = validateMarkerNormals(
    MARKER_ORDER.map((markerId) => markerNormal(markerMap[markerId])),
    centerNormal
  );
  const markerDiagnostics = MARKER_ORDER.map((markerId) => ({
    id: markerId,
    visible: !!markerMap[markerId]?.visible,
    position: markerMap[markerId]?.position || null,
    axes: markerMap[markerId]?.axes || null,
    rotation: markerMap[markerId]?.rotation || null
  }));

  const mergedWarnings = [...validation.warnings, ...normalValidation.warnings];
  const mergedErrors = [...validation.errors, ...normalValidation.errors];
  const mergedValidation = {
    ...validation,
    markerNormalAlignmentDeg: normalValidation.averageAlignmentDeg,
    markerNormalMaxDeviationDeg: normalValidation.maxAlignmentDeg,
    averageMarkerNormal: normalValidation.averageNormal,
    warnings: mergedWarnings,
    errors: mergedErrors,
    reasons: [...mergedErrors, ...mergedWarnings],
    planeSolvable: mergedErrors.length === 0,
    layoutQuality: mergedWarnings.length === 0 ? 'good' : 'distorted',
    status: mergedErrors.length
      ? 'plane-unreliable'
      : mergedWarnings.length
        ? 'layout-distorted'
        : 'layout-good'
  };

  return {
    origin: centerSample.position,
    corners: MARKER_ORDER.map((markerId, index) => ({ id: markerId, ...corners[index] })),
    axes: {
      right: centerRight,
      up: centerNormal,
      forward: centerForward
    },
    normal: centerNormal,
    surface,
    width: validation.width,
    depth: validation.depth,
    isValid: mergedValidation.planeSolvable,
    status: mergedValidation.status,
    planeSolvable: mergedValidation.planeSolvable,
    layoutQuality: mergedValidation.layoutQuality,
    confidence: computeConfidence(mergedValidation),
    visibleMarkers,
    missingMarkers,
    markerDiagnostics,
    validation: mergedValidation
  };
}
