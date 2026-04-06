import { angleBetween, average, distance, dot, normalize, sub } from './plane.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function validateRectangle(corners) {
  const [nw, ne, se, sw] = corners;
  const widthTop = distance(nw, ne);
  const widthBottom = distance(sw, se);
  const depthLeft = distance(nw, sw);
  const depthRight = distance(ne, se);
  const diagonalA = distance(nw, se);
  const diagonalB = distance(ne, sw);
  const expectedSe = { x: ne.x + sw.x - nw.x, y: ne.y + sw.y - nw.y, z: ne.z + sw.z - nw.z };
  const expectedSw = { x: nw.x + se.x - ne.x, y: nw.y + se.y - ne.y, z: nw.z + se.z - ne.z };
  const fourthCornerError = distance(expectedSe, se);
  const rectangularityError =
    Math.abs(widthTop - widthBottom) + Math.abs(depthLeft - depthRight);
  const topEdge = sub(ne, nw);
  const leftEdge = sub(sw, nw);
  const cornerAngleRad = angleBetween(topEdge, leftEdge);
  const cornerAngleDeg = (cornerAngleRad * 180) / Math.PI;
  const orthogonalityErrorDeg = Math.abs(90 - cornerAngleDeg);
  const diagonalError = Math.abs(diagonalA - diagonalB);
  const aspectRatio = depthLeft > 1e-6 ? widthTop / depthLeft : 0;
  const warnings = [];
  const errors = [];

  if (fourthCornerError >= 0.08) {
    warnings.push('fourth-corner-mismatch');
  }
  if (rectangularityError >= 0.12) {
    warnings.push('edge-length-mismatch');
  }
  if (orthogonalityErrorDeg >= 12) {
    warnings.push('non-right-angle-layout');
  }
  if (diagonalError >= 0.12) {
    warnings.push('diagonal-mismatch');
  }
  if ((widthTop + widthBottom) * 0.5 < 0.05) {
    errors.push('field-width-too-small');
  }
  if ((depthLeft + depthRight) * 0.5 < 0.05) {
    errors.push('field-depth-too-small');
  }

  const planeSolvable = errors.length === 0;
  const layoutQuality = warnings.length === 0 ? 'good' : 'distorted';
  const status = planeSolvable ? (layoutQuality === 'good' ? 'layout-good' : 'layout-distorted') : 'plane-unreliable';
  const isValid = planeSolvable;

  return {
    isValid,
    planeSolvable,
    layoutQuality,
    status,
    width: (widthTop + widthBottom) * 0.5,
    depth: (depthLeft + depthRight) * 0.5,
    fourthCornerError,
    rectangularityError,
    diagonalError,
    orthogonalityErrorDeg,
    cornerAngleDeg,
    aspectRatio,
    warnings,
    errors,
    reasons: [...errors, ...warnings],
    expectedCorners: {
      se: expectedSe,
      sw: expectedSw
    },
    distances: {
      widthTop,
      widthBottom,
      depthLeft,
      depthRight,
      diagonalA,
      diagonalB
    }
  };
}

export function validateMarkerNormals(markerNormals, planeNormal) {
  if (!markerNormals.length) {
    return {
      averageNormal: { x: 0, y: 1, z: 0 },
      averageAlignmentDeg: 0,
      maxAlignmentDeg: 0,
      warnings: [],
      errors: []
    };
  }

  const alignedNormals = markerNormals.map((normal) => {
    const unit = normalize(normal);
    return dot(unit, planeNormal) < 0
      ? { x: -unit.x, y: -unit.y, z: -unit.z }
      : unit;
  });
  const averageNormal = normalize(average(alignedNormals));
  const alignmentAngles = alignedNormals.map((normal) => (angleBetween(normal, planeNormal) * 180) / Math.PI);
  const averageAlignmentDeg = alignmentAngles.reduce((sum, value) => sum + value, 0) / alignmentAngles.length;
  const maxAlignmentDeg = Math.max(...alignmentAngles);
  const warnings = [];
  const errors = [];

  if (averageAlignmentDeg >= 10) {
    warnings.push('marker-normal-drift');
  }
  if (maxAlignmentDeg >= 22) {
    warnings.push('marker-normal-outlier');
  }
  if (maxAlignmentDeg >= 45) {
    errors.push('marker-normal-conflict');
  }

  return {
    averageNormal,
    averageAlignmentDeg,
    maxAlignmentDeg,
    warnings,
    errors
  };
}

export function markerNormal(markerPose) {
  return markerPose.axes?.up || { x: 0, y: 1, z: 0 };
}

export function computeConfidence(validation) {
  const penalty =
    validation.rectangularityError * 0.9 +
    validation.fourthCornerError * 1.1 +
    validation.diagonalError +
    validation.orthogonalityErrorDeg / 90;

  return clamp(1 - penalty, validation.planeSolvable ? 0.45 : 0.1, 0.99);
}
