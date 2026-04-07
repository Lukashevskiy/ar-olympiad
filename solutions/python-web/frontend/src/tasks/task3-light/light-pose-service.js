function vec(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

function scale(v, s) {
  return vec(v.x * s, v.y * s, v.z * s);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function length(v) {
  return Math.sqrt(dot(v, v));
}

function normalize(v) {
  const len = length(v);
  if (len < 1e-8) {
    return vec(0, -1, 0);
  }
  return scale(v, 1 / len);
}

const FIXED_DIRECTION = normalize({ x: -0.2, y: -0.96, z: 0.18 });

export function buildLightPose(lightMarker, mode = 'ambient', intensity = 1) {
  if (!lightMarker) {
    return {
      position: { x: 0, y: 0, z: 0 },
      direction: FIXED_DIRECTION,
      lightType: mode === 'ambient' ? 'ambient' : 'directional',
      markerId: 'light-main',
      mode,
      visible: false,
      intensity,
      confidence: 0
    };
  }

  const direction = mode === 'directional-marker'
    ? normalize(lightMarker.direction || FIXED_DIRECTION)
    : FIXED_DIRECTION;

  return {
    position: lightMarker.position,
    direction,
    lightType: mode === 'ambient' ? 'ambient' : 'directional',
    markerId: lightMarker.markerId || 'light-main',
    mode,
    visible: true,
    intensity,
    confidence: lightMarker.confidence ?? 0.95
  };
}

export function lightDiagnostics(lightPose) {
  return {
    mode: lightPose.mode,
    visible: lightPose.visible,
    markerId: lightPose.markerId,
    lightType: lightPose.lightType,
    intensity: lightPose.intensity,
    confidence: lightPose.confidence,
    position: lightPose.position,
    direction: lightPose.direction
  };
}
