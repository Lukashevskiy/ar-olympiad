import { buildLightPose } from './light-pose-service.js';

export function createLightMarkerTracker({ getLightMarker }) {
  return {
    evaluate() {
      return buildLightPose(getLightMarker());
    }
  };
}
