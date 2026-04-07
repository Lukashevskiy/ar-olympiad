function vec(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

function add(a, b) {
  return vec(a.x + b.x, a.y + b.y, a.z + b.z);
}

function sub(a, b) {
  return vec(a.x - b.x, a.y - b.y, a.z - b.z);
}

function scale(v, s) {
  return vec(v.x * s, v.y * s, v.z * s);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return vec(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

function length(v) {
  return Math.sqrt(dot(v, v));
}

function normalize(v) {
  const len = length(v);
  if (len < 1e-8) {
    return vec(0, 1, 0);
  }
  return scale(v, 1 / len);
}

function distance(a, b) {
  return length(sub(a, b));
}

function average(points) {
  if (!points.length) {
    return vec();
  }
  return scale(points.reduce((acc, point) => add(acc, point), vec()), 1 / points.length);
}

function angleBetween(a, b) {
  const cosine = Math.max(-1, Math.min(1, dot(normalize(a), normalize(b))));
  return Math.acos(cosine);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createFieldPose() {
  return {
    origin: { x: 0, y: 0, z: 0 },
    corners: [
      { id: 'field-nw', x: -0.5, y: 0, z: -0.35 },
      { id: 'field-ne', x: 0.5, y: 0, z: -0.35 },
      { id: 'field-se', x: 0.5, y: 0, z: 0.35 },
      { id: 'field-sw', x: -0.5, y: 0, z: 0.35 }
    ],
    axes: {
      right: { x: 1, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      forward: { x: 0, y: 0, z: 1 }
    },
    normal: { x: 0, y: 1, z: 0 },
    width: 1,
    depth: 0.7,
    isValid: true,
    confidence: 0.95,
    validation: {
      rectangularityError: 0.0,
      fourthCornerError: 0.0
    }
  };
}

export function buildFieldPose(markerMap) {
  const order = ['field-nw', 'field-ne', 'field-se', 'field-sw'];
  const markers = order.map((id) => markerMap[id]);

  if (markers.some((marker) => !marker?.visible || !marker?.position)) {
    return {
      ...createFieldPose(),
      corners: [],
      isValid: false,
      confidence: 0,
      status: 'insufficient-markers',
      planeSolvable: false,
      missingMarkers: order.filter((id) => !(markerMap[id]?.visible && markerMap[id]?.position)),
      visibleMarkers: order.filter((id) => markerMap[id]?.visible && markerMap[id]?.position),
      validation: {
        rectangularityError: 1,
        fourthCornerError: 1,
        orthogonalityErrorDeg: 90,
        warnings: [],
        errors: ['missing-markers']
      }
    };
  }

  const [nw, ne, se, sw] = markers.map((marker) => marker.position);
  const widthTop = distance(nw, ne);
  const widthBottom = distance(sw, se);
  const depthLeft = distance(nw, sw);
  const depthRight = distance(ne, se);
  const expectedSe = { x: ne.x + sw.x - nw.x, y: ne.y + sw.y - nw.y, z: ne.z + sw.z - nw.z };
  const fourthCornerError = distance(expectedSe, se);
  const rectangularityError = Math.abs(widthTop - widthBottom) + Math.abs(depthLeft - depthRight);
  const angleDeg = (angleBetween(sub(ne, nw), sub(sw, nw)) * 180) / Math.PI;
  const orthogonalityErrorDeg = Math.abs(90 - angleDeg);
  const geometricNormal = normalize(cross(sub(ne, nw), sub(sw, nw)));
  const markerNormals = markers
    .map((marker) => marker.axes?.up)
    .filter(Boolean)
    .map((normal) => (dot(normal, geometricNormal) < 0 ? scale(normal, -1) : normal));
  const averageMarkerNormal = markerNormals.length ? normalize(average(markerNormals)) : geometricNormal;
  const normal = normalize(add(scale(geometricNormal, 0.6), scale(averageMarkerNormal, 0.4)));
  const right = normalize(sub(ne, nw));
  const forward = normalize(cross(normal, right));
  const warnings = [];
  const errors = [];

  if (fourthCornerError > 0.08) {
    warnings.push('fourth-corner-mismatch');
  }
  if (rectangularityError > 0.12) {
    warnings.push('edge-length-mismatch');
  }
  if (orthogonalityErrorDeg > 12) {
    warnings.push('non-right-angle-layout');
  }
  if (((widthTop + widthBottom) * 0.5) < 0.05 || ((depthLeft + depthRight) * 0.5) < 0.05) {
    errors.push('degenerate-field');
  }

  return {
    origin: average([nw, ne, se, sw]),
    corners: [
      { id: 'field-nw', ...nw },
      { id: 'field-ne', ...ne },
      { id: 'field-se', ...se },
      { id: 'field-sw', ...sw }
    ],
    axes: {
      right,
      up: normal,
      forward
    },
    normal,
    width: (widthTop + widthBottom) * 0.5,
    depth: (depthLeft + depthRight) * 0.5,
    isValid: errors.length === 0,
    planeSolvable: errors.length === 0,
    status: errors.length ? 'plane-unreliable' : warnings.length ? 'layout-distorted' : 'layout-good',
    confidence: clamp(1 - (fourthCornerError * 1.2 + rectangularityError + orthogonalityErrorDeg / 90), errors.length ? 0.1 : 0.45, 0.99),
    visibleMarkers: order,
    missingMarkers: [],
    validation: {
      rectangularityError,
      fourthCornerError,
      orthogonalityErrorDeg,
      warnings,
      errors
    }
  };
}
