import { bilerp } from '../../math/interpolation.js';
import { add, average, dot, normalize, scale } from '../../math/plane.js';
import { markerNormal } from '../../math/validation.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cornerWeights(u, v) {
  return {
    nw: (1 - u) * (1 - v),
    ne: u * (1 - v),
    se: u * v,
    sw: (1 - u) * v
  };
}

function buildCornerData(markerMap) {
  return {
    nw: { point: markerMap['field-nw'].position, normal: normalize(markerNormal(markerMap['field-nw'])) },
    ne: { point: markerMap['field-ne'].position, normal: normalize(markerNormal(markerMap['field-ne'])) },
    se: { point: markerMap['field-se'].position, normal: normalize(markerNormal(markerMap['field-se'])) },
    sw: { point: markerMap['field-sw'].position, normal: normalize(markerNormal(markerMap['field-sw'])) }
  };
}

function projectToTangentBlend(basePoint, referenceNormal, cornerData, weights) {
  const offsets = Object.entries(cornerData).map(([key, corner]) => {
    const denominator = dot(corner.normal, referenceNormal);
    if (Math.abs(denominator) < 1e-5) {
      return 0;
    }

    const delta = {
      x: corner.point.x - basePoint.x,
      y: corner.point.y - basePoint.y,
      z: corner.point.z - basePoint.z
    };
    const planeOffset = dot(corner.normal, delta) / denominator;
    return planeOffset * weights[key];
  });

  const displacement = offsets.reduce((sum, value) => sum + value, 0);
  return add(basePoint, scale(referenceNormal, displacement));
}

export function createNormalGuidedSurface(markerMap) {
  const cornerData = buildCornerData(markerMap);
  const cornerNormals = Object.values(cornerData).map((corner) => corner.normal);
  const referenceNormal = normalize(average(cornerNormals));
  const corners = [
    cornerData.nw.point,
    cornerData.ne.point,
    cornerData.se.point,
    cornerData.sw.point
  ];

  return {
    type: 'normal-guided-patch',
    referenceNormal,
    cornerNormals: {
      nw: cornerData.nw.normal,
      ne: cornerData.ne.normal,
      se: cornerData.se.normal,
      sw: cornerData.sw.normal
    },
    sample(u, v) {
      const clampedU = clamp(u, 0, 1);
      const clampedV = clamp(v, 0, 1);
      const basePoint = bilerp(corners[0], corners[1], corners[2], corners[3], clampedU, clampedV);
      const weights = cornerWeights(clampedU, clampedV);
      const point = projectToTangentBlend(basePoint, referenceNormal, cornerData, weights);
      const normal = normalize(average([
        scale(cornerData.nw.normal, weights.nw),
        scale(cornerData.ne.normal, weights.ne),
        scale(cornerData.se.normal, weights.se),
        scale(cornerData.sw.normal, weights.sw)
      ]));

      return {
        position: point,
        normal
      };
    }
  };
}
