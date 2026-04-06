export function buildLightPose(lightMarker) {
  if (!lightMarker) {
    return {
      position: { x: 0, y: 1, z: 0 },
      direction: { x: 0, y: -1, z: 0 },
      lightType: 'point',
      markerId: 'light-main',
      confidence: 0
    };
  }

  return {
    position: lightMarker.position,
    direction: lightMarker.direction || { x: 0, y: -1, z: 0 },
    lightType: lightMarker.lightType || 'point',
    markerId: lightMarker.id || 'light-main',
    confidence: lightMarker.confidence ?? 0.9
  };
}
