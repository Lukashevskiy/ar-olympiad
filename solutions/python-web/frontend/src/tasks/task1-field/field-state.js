export function createFieldPose() {
  return {
    origin: { x: 0, y: 0, z: 0 },
    corners: [
      { id: 'field-nw', x: -0.5, y: 0, z: -0.35 },
      { id: 'field-ne', x: 0.5, y: 0, z: -0.35 },
      { id: 'field-se', x: 0.5, y: 0, z: 0.35 },
      { id: 'field-sw', x: -0.5, y: 0, z: 0.35 }
    ],
    axes: {
      right: { x: 1, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      forward: { x: 0, y: 0, z: 1 }
    },
    normal: { x: 0, y: 1, z: 0 },
    width: 1,
    depth: 0.7,
    isValid: true,
    confidence: 0.95,
    validation: {
      rectangularityError: 0.0,
      fourthCornerError: 0.0
    }
  };
}
