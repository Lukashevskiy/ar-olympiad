export function createFakeLight() {
  const light = {
    id: 'light-main',
    position: { x: 0.35, y: 1.15, z: -0.2 },
    direction: { x: -0.2, y: -0.95, z: 0.18 },
    lightType: 'point',
    confidence: 0.97
  };
  return {
    get() {
      return { ...light, position: { ...light.position }, direction: { ...light.direction } };
    }
  };
}
