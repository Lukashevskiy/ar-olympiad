import { createFieldPose } from '../tasks/task1-field/field-state.js';
import { createSyntheticBallFrame } from '../tasks/task2-object-detection/ball-frame-debug.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';

export function createDebugPayloads() {
  return {
    fieldPose: createFieldPose(),
    lightPose: createLightPose(),
    ballFrame: createSyntheticBallFrame()
  };
}
