import { buildFieldPose } from './field-validator.js';

export function createFourMarkerSurface({ getMarkers, onFieldPose }) {
  return {
    evaluate() {
      const markerMap = getMarkers();
      const fieldPose = buildFieldPose(markerMap);
      onFieldPose?.(fieldPose);
      return fieldPose;
    }
  };
}
