import { detectObject, projectShadow } from '../api/client.js';
import { buildDetectionRequest } from '../tasks/task2-object-detection/request-builder.js';
import { buildShadowRequest } from '../tasks/task4-shadow/request-builder.js';
import { createDebugPayloads } from '../debug/mock-payloads.js';
import { createDebugView } from '../debug/debug-view.js';
import { createDetectionDebugControls } from '../debug/detection-debug-controls.js';

function cornersArrayToMap(corners) {
  return {
    nw: { ...corners[0] },
    ne: { ...corners[1] },
    se: { ...corners[2] },
    sw: { ...corners[3] }
  };
}

function cornersMapToArray(corners) {
  return [corners.nw, corners.ne, corners.se, corners.sw].map((corner) => ({
    x: corner.x,
    y: corner.y,
    z: 0
  }));
}

async function start() {
  const root = document.getElementById('app');
  const view = createDebugView(root);
  const payloads = createDebugPayloads();
  const state = {
    fieldPose: payloads.fieldPose,
    lightPose: payloads.lightPose,
    frame: {
      imageBase64: payloads.ballFrame.imageBase64,
      previewUrl: payloads.ballFrame.previewUrl
    },
    fieldImageCorners: cornersArrayToMap(payloads.ballFrame.fieldImageCorners)
  };

  async function runDetection() {
    const detection = await detectObject(buildDetectionRequest(state.fieldPose, {
      detectorMode: 'ball-cv',
      imageBase64: state.frame.imageBase64,
      fieldImageCorners: cornersMapToArray(state.fieldImageCorners)
    }));
    const shadow = await projectShadow(
      buildShadowRequest(state.fieldPose, state.lightPose, detection.objectPose)
    );

    view.render({
      mode: 'debug',
      detectorMode: 'ball-cv',
      previewUrl: state.frame.previewUrl,
      fieldImageCorners: cornersMapToArray(state.fieldImageCorners),
      fieldPose: state.fieldPose,
      lightPose: state.lightPose,
      objectPose: detection.objectPose,
      shadowProjection: shadow.shadowProjection,
      debugState: {
        mode: 'debug',
        markerVisibility: {
          'field-nw': true,
          'field-ne': true,
          'field-se': true,
          'field-sw': true,
          'light-main': true
        },
        fieldValid: state.fieldPose.isValid,
        projectionStatus: shadow.shadowProjection.status,
        errors: shadow.shadowProjection.status === 'ok' ? [] : [shadow.shadowProjection.status],
        selectedEntity: 'shadow',
        toggles: {
          fieldGizmos: true,
          lightGizmos: true,
          objectGizmos: true,
          shadowGizmos: true
        }
      }
    });
  }

  const controls = createDetectionDebugControls(root, {
    fieldImageCorners: state.fieldImageCorners
  }, {
    onImageSelected({ imageBase64, previewUrl }) {
      state.frame = { imageBase64, previewUrl };
    },
    onUseSynthetic() {
      const synthetic = createDebugPayloads().ballFrame;
      state.frame = {
        imageBase64: synthetic.imageBase64,
        previewUrl: synthetic.previewUrl
      };
      state.fieldImageCorners = cornersArrayToMap(synthetic.fieldImageCorners);
      controls.syncFieldImageCorners(state.fieldImageCorners);
    },
    onCornerChange(cornerId, axis, value) {
      state.fieldImageCorners[cornerId][axis] = Math.max(0, Math.min(1, value));
    },
    async onRun() {
      await runDetection();
    }
  });

  controls.setStatus('Ready');
  await runDetection();
}

start();
