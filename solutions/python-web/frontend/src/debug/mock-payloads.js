import { createFieldPose } from '../tasks/task1-field/field-state.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';

export function createDebugPayloads() {
  return {
    fieldPose: createFieldPose(),
    lightPose: createLightPose()
  };
}
