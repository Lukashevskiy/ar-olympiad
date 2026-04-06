const FIELD_MARKER_IDS = ['field-nw', 'field-ne', 'field-se', 'field-sw'];

function cloneMarker(marker) {
  if (!marker) {
    return null;
  }

  return {
    id: marker.id,
    position: marker.position ? { ...marker.position } : null,
    axes: marker.axes
      ? {
          right: marker.axes.right ? { ...marker.axes.right } : null,
          up: marker.axes.up ? { ...marker.axes.up } : null,
          forward: marker.axes.forward ? { ...marker.axes.forward } : null
        }
      : null,
    visible: marker.visible ?? false
  };
}

export function createMarkerPoseRegistry(initialMarkers = {}) {
  const markers = {};

  FIELD_MARKER_IDS.forEach((markerId) => {
    markers[markerId] = cloneMarker(initialMarkers[markerId]) || {
      id: markerId,
      position: null,
      axes: null,
      visible: false
    };
  });

  return {
    getAll() {
      return Object.fromEntries(
        Object.entries(markers).map(([markerId, marker]) => [markerId, cloneMarker(marker)])
      );
    },
    update(markerId, patch) {
      if (!markers[markerId]) {
        return;
      }
      markers[markerId] = {
        ...markers[markerId],
        ...patch,
        position: patch.position ? { ...patch.position } : markers[markerId].position,
        axes: patch.axes
          ? {
              right: patch.axes.right ? { ...patch.axes.right } : markers[markerId].axes?.right || null,
              up: patch.axes.up ? { ...patch.axes.up } : markers[markerId].axes?.up || null,
              forward: patch.axes.forward ? { ...patch.axes.forward } : markers[markerId].axes?.forward || null
            }
          : markers[markerId].axes
      };
    },
    ids: [...FIELD_MARKER_IDS]
  };
}

export { FIELD_MARKER_IDS };
