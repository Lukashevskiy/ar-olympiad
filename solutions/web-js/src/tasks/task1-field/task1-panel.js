import { formatBool, formatPercent, formatVec3 } from '../../math/vector-format.js';
import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function renderMarkerList(fieldPose) {
  if (!fieldPose.markerDiagnostics?.length) {
    return 'markers: unavailable';
  }

  return fieldPose.markerDiagnostics.map((marker) => [
    `${marker.id}: ${marker.visible ? 'visible' : 'missing'}`,
    `pos ${formatVec3(marker.position)}`,
    `rot ${formatVec3(marker.rotation || { x: 0, y: 0, z: 0 })}`
  ].join('\n')).join('\n\n');
}

export function createTask1Panel(mode) {
  const shell = createCollapsiblePanel({
    title: `Task 1 Field Demo | ${mode}`,
    side: 'right',
    width: '320px',
    defaultCollapsed: false
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
    render(fieldPose) {
      const confidenceBarColor = !fieldPose.planeSolvable
        ? '#ff5f56'
        : fieldPose.layoutQuality === 'distorted'
          ? '#ffbd2e'
          : '#3aa1ff';

      confidenceText.textContent = `confidence: ${formatPercent(fieldPose.confidence)}`;
      confidenceBar.style.width = `${Math.max(4, fieldPose.confidence * 100)}%`;
      confidenceBar.style.background = confidenceBarColor;

      body.textContent = [
        `plane solvable: ${formatBool(fieldPose.planeSolvable)}`,
        `layout quality: ${fieldPose.layoutQuality}`,
        `status: ${fieldPose.status}`,
        `visible markers: ${fieldPose.visibleMarkers?.join(', ') || 'none'}`,
        `missing markers: ${fieldPose.missingMarkers?.join(', ') || 'none'}`,
        `origin: ${formatVec3(fieldPose.origin)}`,
        `normal: ${formatVec3(fieldPose.normal)}`,
        `width x depth: ${fieldPose.width.toFixed(3)} x ${fieldPose.depth.toFixed(3)}`,
        `rectangularity error: ${fieldPose.validation.rectangularityError.toFixed(3)}`,
        `fourth corner error: ${fieldPose.validation.fourthCornerError.toFixed(3)}`,
        `diagonal error: ${fieldPose.validation.diagonalError.toFixed(3)}`,
        `corner angle: ${fieldPose.validation.cornerAngleDeg.toFixed(2)} deg`,
        `marker normal avg drift: ${fieldPose.validation.markerNormalAlignmentDeg.toFixed(2)} deg`,
        `marker normal max drift: ${fieldPose.validation.markerNormalMaxDeviationDeg.toFixed(2)} deg`,
        `average marker normal: ${formatVec3(fieldPose.validation.averageMarkerNormal)}`,
        `warnings: ${fieldPose.validation.warnings.length ? fieldPose.validation.warnings.join(', ') : 'none'}`,
        `errors: ${fieldPose.validation.errors.length ? fieldPose.validation.errors.join(', ') : 'none'}`,
        `expected se: ${formatVec3(fieldPose.validation.expectedCorners.se)}`,
        '',
        renderMarkerList(fieldPose)
      ].join('\n');
    },
    setCollapsed(nextCollapsed) {
      shell.setCollapsed(nextCollapsed);
    }
  };
}
