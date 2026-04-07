export function createStubObjectDetector() {
  return {
    detect({ fieldPose }) {
      return {
        className: 'debug-cube',
        source: 'stub-field-detector',
        surfaceUv: fieldPose.planeSolvable
          ? { u: 0.58, v: 0.44 }
          : { u: 0.5, v: 0.5 },
        heightAboveField: 0.18,
        rotation: { x: 0, y: 25, z: 0 },
        size: { x: 0.18, y: 0.36, z: 0.18 },
        contour: [],
        mask: null,
        confidence: 0.65
      };
    }
  };
}
