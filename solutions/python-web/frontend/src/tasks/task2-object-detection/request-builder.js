export function buildDetectionRequest(fieldPose) {
  return {
    frameId: 'frontend-debug-frame',
    fieldPose,
    debug: true
  };
}
