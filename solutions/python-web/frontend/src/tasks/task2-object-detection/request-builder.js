export function buildDetectionRequest(fieldPose, options = {}) {
  return {
    frameId: 'frontend-debug-frame',
    fieldPose,
    debug: true,
    detectorMode: options.detectorMode || 'mock',
    imageBase64: options.imageBase64 || null,
    fieldImageCorners: options.fieldImageCorners || null
  };
}
