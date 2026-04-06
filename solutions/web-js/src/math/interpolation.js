import { add, scale } from './plane.js';

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVec3(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t)
  };
}

export function bilerp(p00, p10, p11, p01, u, v) {
  const top = add(scale(p00, 1 - u), scale(p10, u));
  const bottom = add(scale(p01, 1 - u), scale(p11, u));
  return add(scale(top, 1 - v), scale(bottom, v));
}
