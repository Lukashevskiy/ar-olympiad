export function vec(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function add(a, b) {
  return vec(a.x + b.x, a.y + b.y, a.z + b.z);
}

export function sub(a, b) {
  return vec(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function scale(v, s) {
  return vec(v.x * s, v.y * s, v.z * s);
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a, b) {
  return vec(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

export function length(v) {
  return Math.sqrt(dot(v, v));
}

export function normalize(v) {
  const len = length(v);
  if (len < 1e-8) {
    return vec(0, 1, 0);
  }
  return scale(v, 1 / len);
}

export function average(vectors) {
  if (!vectors.length) {
    return vec(0, 1, 0);
  }
  return scale(vectors.reduce((acc, vector) => add(acc, vector), vec()), 1 / vectors.length);
}

export function radians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function rotateEuler(vector, rotationDeg) {
  const rx = radians(rotationDeg.x || 0);
  const ry = radians(rotationDeg.y || 0);
  const rz = radians(rotationDeg.z || 0);

  let { x, y, z } = vector;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  let nextY = y * cosX - z * sinX;
  let nextZ = y * sinX + z * cosX;
  y = nextY;
  z = nextZ;

  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  let nextX = x * cosY + z * sinY;
  nextZ = -x * sinY + z * cosY;
  x = nextX;
  z = nextZ;

  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  nextX = x * cosZ - y * sinZ;
  nextY = x * sinZ + y * cosZ;

  return vec(nextX, nextY, z);
}

export function axesFromRotation(rotationDeg = { x: 0, y: 0, z: 0 }) {
  return {
    right: normalize(rotateEuler(vec(1, 0, 0), rotationDeg)),
    up: normalize(rotateEuler(vec(0, 1, 0), rotationDeg)),
    forward: normalize(rotateEuler(vec(0, 0, 1), rotationDeg))
  };
}

export function angleBetween(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  const cosine = Math.max(-1, Math.min(1, dot(na, nb)));
  return Math.acos(cosine);
}

export function midpoint(points) {
  if (!points.length) return vec();
  const total = points.reduce((acc, point) => add(acc, point), vec());
  return scale(total, 1 / points.length);
}

export function distance(a, b) {
  return length(sub(a, b));
}

export function buildPlaneFromCorners(corners) {
  const origin = midpoint(corners);
  const right = normalize(sub(corners[1], corners[0]));
  const forward = normalize(sub(corners[3], corners[0]));
  const normal = normalize(cross(right, forward));
  const orthogonalForward = normalize(cross(normal, right));
  return {
    origin,
    normal,
    axes: {
      right,
      up: normal,
      forward: orthogonalForward
    }
  };
}
