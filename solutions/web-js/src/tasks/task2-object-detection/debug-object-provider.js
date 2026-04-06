export function createDebugObjectProvider(config = {}) {
  const defaults = {
    className: 'debug-cylinder',
    position: { x: 0.1, y: 0.22, z: 0.08 },
    rotation: { x: 0, y: 10, z: 0 },
    size: { x: 0.16, y: 0.4, z: 0.16 },
    confidence: 0.95
  };
  const state = { ...defaults, ...config };
  return {
    get() {
      return {
        className: state.className,
        position: { ...state.position },
        rotation: { ...state.rotation },
        size: { ...state.size },
        contour: [],
        mask: null,
        confidence: state.confidence
      };
    },
    setPosition(next) {
      state.position = { ...state.position, ...next };
    }
  };
}
