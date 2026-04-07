export function createDebugObjectProvider(config = {}) {
  const defaults = {
    className: 'debug-cylinder',
    source: 'debug-object-provider',
    surfaceUv: { u: 0.56, v: 0.42 },
    heightAboveField: 0.22,
    rotation: { x: 0, y: 10, z: 0 },
    size: { x: 0.16, y: 0.4, z: 0.16 },
    confidence: 0.95
  };
  const state = { ...defaults, ...config };
  return {
    get() {
      return {
        className: state.className,
        surfaceUv: { ...state.surfaceUv },
        heightAboveField: state.heightAboveField,
        rotation: { ...state.rotation },
        size: { ...state.size },
        contour: [],
        mask: null,
        confidence: state.confidence,
        source: state.source
      };
    },
    setSurfaceUv(next) {
      state.surfaceUv = { ...state.surfaceUv, ...next };
    },
    setHeightAboveField(next) {
      state.heightAboveField = next;
    }
  };
}
