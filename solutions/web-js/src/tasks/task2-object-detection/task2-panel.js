import { formatPercent, formatVec3 } from '../../math/vector-format.js';
import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function formatUv(surfaceUv) {
  if (!surfaceUv) {
    return 'n/a';
  }
  return `${surfaceUv.u.toFixed(3)}, ${surfaceUv.v.toFixed(3)}`;
}

export function createTask2Panel(mode, options = {}) {
  const shell = createCollapsiblePanel({
    title: options.title || `Task 2 Object Demo | ${mode}`,
    side: options.side || 'right',
    width: options.width || '320px',
    top: options.top || '352px',
    defaultCollapsed: options.defaultCollapsed ?? false
  });
  const { body: panel } = shell;

  const confidenceText = document.createElement('div');
  confidenceText.style.marginTop = '2px';
  panel.appendChild(confidenceText);

  const confidenceTrack = document.createElement('div');
  confidenceTrack.style.margin = '6px 0 10px';
  confidenceTrack.style.height = '8px';
  confidenceTrack.style.background = 'rgba(255,255,255,0.08)';
  confidenceTrack.style.borderRadius = '999px';
  confidenceTrack.style.overflow = 'hidden';
  const confidenceBar = document.createElement('div');
  confidenceBar.style.height = '100%';
  confidenceTrack.appendChild(confidenceBar);
  panel.appendChild(confidenceTrack);

  const body = document.createElement('pre');
  body.style.margin = '0';
  body.style.whiteSpace = 'pre-wrap';
  body.style.fontFamily = 'inherit';
  panel.appendChild(body);

  return {
    render({ fieldPose, objectPose }) {
      confidenceText.textContent = `object confidence: ${formatPercent(objectPose.confidence)}`;
      confidenceBar.style.width = `${Math.max(4, objectPose.confidence * 100)}%`;
      confidenceBar.style.background = fieldPose.planeSolvable ? '#7ed957' : '#ff5f56';

      body.textContent = [
        `class: ${objectPose.className}`,
        `source: ${objectPose.source || 'unknown'}`,
        `field status: ${objectPose.fieldStatus || 'unknown'}`,
        `surface uv: ${formatUv(objectPose.surfaceUv)}`,
        `height above field: ${(objectPose.heightAboveField ?? 0).toFixed(3)}`,
        `anchor on field: ${formatVec3(objectPose.fieldAnchor)}`,
        `world position: ${formatVec3(objectPose.position)}`,
        `rotation: ${formatVec3(objectPose.rotation)}`,
        `size: ${formatVec3(objectPose.size)}`,
        '',
        `field origin: ${formatVec3(fieldPose.origin)}`,
        `field normal: ${formatVec3(fieldPose.normal)}`,
        `field status: ${fieldPose.status}`
      ].join('\n');
    },
    setCollapsed(nextCollapsed) {
      shell.setCollapsed(nextCollapsed);
    }
  };
}
