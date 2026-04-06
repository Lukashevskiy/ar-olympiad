import { getHealth, detectObject, projectShadow } from '../api/client.js';
import { createFieldPose } from '../tasks/task1-field/field-state.js';
import { buildDetectionRequest } from '../tasks/task2-object-detection/request-builder.js';
import { createLightPose } from '../tasks/task3-light/light-state.js';
import { buildShadowRequest } from '../tasks/task4-shadow/request-builder.js';
import { createStatusOverlay } from '../ui/status-overlay.js';
import { createSummaryPanel } from '../ui/summary-panel.js';

async function start() {
  const root = document.getElementById('app');
  const left = document.createElement('div');
  const right = document.createElement('div');
  right.style.borderLeft = '1px solid rgba(120, 140, 160, 0.2)';
  root.append(left, right);

  const overlay = createStatusOverlay(left);
  const summary = createSummaryPanel(right);

  const health = await getHealth();
  overlay.set(`backend: ${health.status}`);

  const fieldPose = createFieldPose();
  const lightPose = createLightPose();
  const detection = await detectObject(buildDetectionRequest(fieldPose));
  const shadow = await projectShadow(buildShadowRequest(fieldPose, lightPose, detection.objectPose));

  left.innerHTML += `
    <div style="padding: 20px">
      <h2>Python Web Scene</h2>
      <p>Field confidence: ${fieldPose.confidence.toFixed(2)}</p>
      <p>Object class: ${detection.objectPose.className}</p>
      <p>Shadow status: ${shadow.shadowProjection.status}</p>
    </div>
  `;

  summary.render({
    fieldPose,
    lightPose,
    objectPose: detection.objectPose,
    shadowProjection: shadow.shadowProjection
  });
}

start();
