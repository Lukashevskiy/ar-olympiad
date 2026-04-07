import { formatBool, formatPercent, formatVec3 } from '../../math/vector-format.js';
import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function formatUv(surfaceUv) {
  if (!surfaceUv) {
    return 'n/a';
  }
  return `${surfaceUv.u.toFixed(3)}, ${surfaceUv.v.toFixed(3)}`;
}

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

function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.margin = '14px 0 8px';
  title.style.fontWeight = '700';
  title.style.color = '#8bd5ff';
  return title;
}

function createPreBlock() {
  const block = document.createElement('pre');
  block.style.margin = '0';
  block.style.whiteSpace = 'pre-wrap';
  block.style.fontFamily = 'inherit';
  return block;
}

export function createTask2DebugStatePanel() {
  const shell = createCollapsiblePanel({
    title: 'Task 2 Debug State',
    side: 'right',
    width: '340px',
    top: '12px',
    defaultCollapsed: false
  });
  const { body: panel } = shell;

  const fieldConfidenceText = document.createElement('div');
  panel.appendChild(fieldConfidenceText);

  const fieldConfidenceTrack = document.createElement('div');
  fieldConfidenceTrack.style.margin = '6px 0 10px';
  fieldConfidenceTrack.style.height = '8px';
  fieldConfidenceTrack.style.background = 'rgba(255,255,255,0.08)';
  fieldConfidenceTrack.style.borderRadius = '999px';
  fieldConfidenceTrack.style.overflow = 'hidden';
  const fieldConfidenceBar = document.createElement('div');
  fieldConfidenceBar.style.height = '100%';
  fieldConfidenceTrack.appendChild(fieldConfidenceBar);
  panel.appendChild(fieldConfidenceTrack);

  panel.appendChild(createSectionTitle('Field State'));
  const fieldBlock = createPreBlock();
  panel.appendChild(fieldBlock);

  panel.appendChild(createSectionTitle('Object State'));
  const objectBlock = createPreBlock();
  panel.appendChild(objectBlock);

  return {
    render({ fieldPose, objectPose }) {
      const fieldBarColor = !fieldPose.planeSolvable
        ? '#ff5f56'
        : fieldPose.layoutQuality === 'distorted'
          ? '#ffbd2e'
          : '#3aa1ff';

      fieldConfidenceText.textContent = `field confidence: ${formatPercent(fieldPose.confidence)} | object confidence: ${formatPercent(objectPose.confidence)}`;
      fieldConfidenceBar.style.width = `${Math.max(4, fieldPose.confidence * 100)}%`;
      fieldConfidenceBar.style.background = fieldBarColor;

      fieldBlock.textContent = [
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
        `warnings: ${fieldPose.validation.warnings.length ? fieldPose.validation.warnings.join(', ') : 'none'}`,
        `errors: ${fieldPose.validation.errors.length ? fieldPose.validation.errors.join(', ') : 'none'}`,
        '',
        renderMarkerList(fieldPose)
      ].join('\n');

      objectBlock.textContent = [
        `class: ${objectPose.className}`,
        `source: ${objectPose.source || 'unknown'}`,
        `field status: ${objectPose.fieldStatus || 'unknown'}`,
        `surface uv: ${formatUv(objectPose.surfaceUv)}`,
        `height above field: ${(objectPose.heightAboveField ?? 0).toFixed(3)}`,
        `anchor on field: ${formatVec3(objectPose.fieldAnchor)}`,
        `world position: ${formatVec3(objectPose.position)}`,
        `rotation: ${formatVec3(objectPose.rotation)}`,
        `size: ${formatVec3(objectPose.size)}`
      ].join('\n');
    }
  };
}
