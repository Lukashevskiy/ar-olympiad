export function createMarkerPoseRegistry() {
  const store = {};

  return {
    update(markerId, patch) {
      store[markerId] = {
        ...(store[markerId] || { visible: false, position: null, axes: null }),
        ...patch
      };
    },
    getAll() {
      return { ...store };
    }
  };
}
