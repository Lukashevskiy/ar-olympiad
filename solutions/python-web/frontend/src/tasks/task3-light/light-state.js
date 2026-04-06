export function createLightPose() {
  return {
    position: { x: 0.3, y: 1.1, z: -0.2 },
    direction: { x: -0.1, y: -0.98, z: 0.1 },
    lightType: 'point',
    markerId: 'light-main',
    confidence: 0.92
  };
}
