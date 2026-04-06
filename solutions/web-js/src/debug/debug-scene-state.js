export function createDebugSceneState() {
  return {
    mode: 'debug',
    markerVisibility: {
      'field-nw': true,
      'field-ne': true,
      'field-se': true,
      'field-sw': true,
      'light-main': true
    },
    fieldValid: false,
    projectionStatus: 'pending',
    errors: [],
    selectedEntity: 'object',
    toggles: {
      markerGizmos: true,
      fieldGizmos: true,
      lightGizmos: true,
      objectGizmos: true,
      shadowGizmos: true,
      debugGrid: true
    }
  };
}
