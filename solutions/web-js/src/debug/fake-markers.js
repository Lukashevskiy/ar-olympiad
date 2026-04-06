import { axesFromRotation } from '../math/plane.js';

function createMarkerState(position, rotation = { x: 0, y: 0, z: 0 }) {
  return {
    position,
    rotation,
    axes: axesFromRotation(rotation),
    visible: true
  };
}

export function createFakeMarkers() {
  const initialMarkers = {
    'field-nw': {
      id: 'field-nw',
      ...createMarkerState({ x: -0.5, y: 0, z: -0.35 })
    },
    'field-ne': {
      id: 'field-ne',
      ...createMarkerState({ x: 0.5, y: 0, z: -0.32 }, { x: 0, y: 0, z: -1.2 })
    },
    'field-se': {
      id: 'field-se',
      ...createMarkerState({ x: 0.48, y: 0, z: 0.38 }, { x: 1.1, y: 0, z: 0 })
    },
    'field-sw': {
      id: 'field-sw',
      ...createMarkerState({ x: -0.52, y: 0, z: 0.36 })
    }
  };

  const markers = JSON.parse(JSON.stringify(initialMarkers));
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  return {
    getAll() {
      return JSON.parse(JSON.stringify(markers));
    },
    updatePosition(markerId, positionPatch) {
      if (!markers[markerId]) {
        return;
      }
      markers[markerId].position = {
        ...markers[markerId].position,
        ...positionPatch
      };
      notify();
    },
    updateRotation(markerId, rotationPatch) {
      if (!markers[markerId]) {
        return;
      }
      markers[markerId].rotation = {
        ...markers[markerId].rotation,
        ...rotationPatch
      };
      markers[markerId].axes = axesFromRotation(markers[markerId].rotation);
      notify();
    },
    setVisible(markerId, visible) {
      if (!markers[markerId]) {
        return;
      }
      markers[markerId].visible = visible;
      notify();
    },
    reset() {
      Object.keys(markers).forEach((markerId) => {
        markers[markerId] = JSON.parse(JSON.stringify(initialMarkers[markerId]));
      });
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
