export function createStubObjectDetector() {
  return {
    detect({ fieldPose }) {
      return {
        className: 'debug-cube',
        position: {
          x: fieldPose.origin.x + 0.12,
          y: fieldPose.origin.y + 0.18,
          z: fieldPose.origin.z + 0.04
        },
        rotation: { x: 0, y: 25, z: 0 },
        size: { x: 0.18, y: 0.36, z: 0.18 },
        contour: [],
        mask: null,
        confidence: 0.65
      };
    }
  };
}
