export function createFakeObject() {
  const objectPose = {
    className: 'debug-box',
    position: { x: 0.08, y: 0.18, z: 0.04 },
    rotation: { x: 0, y: 20, z: 0 },
    size: { x: 0.16, y: 0.36, z: 0.16 },
    contour: [],
    mask: null,
    confidence: 0.96
  };
  return {
    get() {
      return JSON.parse(JSON.stringify(objectPose));
    }
  };
}
