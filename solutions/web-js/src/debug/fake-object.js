export function createFakeObject() {
  const initialObjectPose = {
    className: 'debug-box',
    source: 'debug-object-provider',
    surfaceUv: { u: 0.54, v: 0.46 },
    heightAboveField: 0.18,
    rotation: { x: 0, y: 20, z: 0 },
    size: { x: 0.16, y: 0.36, z: 0.16 },
    contour: [],
    mask: null,
    confidence: 0.96
  };
  const objectPose = JSON.parse(JSON.stringify(initialObjectPose));
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    get() {
      return JSON.parse(JSON.stringify(objectPose));
    },
    updateSurfaceUv(patch) {
      objectPose.surfaceUv = { ...objectPose.surfaceUv, ...patch };
      notify();
    },
    updateRotation(patch) {
      objectPose.rotation = { ...objectPose.rotation, ...patch };
      notify();
    },
    updateSize(patch) {
      objectPose.size = { ...objectPose.size, ...patch };
      notify();
    },
    setHeightAboveField(value) {
      objectPose.heightAboveField = value;
      notify();
    },
    setConfidence(value) {
      objectPose.confidence = value;
      notify();
    },
    reset() {
      Object.assign(objectPose, JSON.parse(JSON.stringify(initialObjectPose)));
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}
