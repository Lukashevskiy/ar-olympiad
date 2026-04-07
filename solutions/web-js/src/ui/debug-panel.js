import { formatBool, formatVec3 } from '../math/vector-format.js';
import { createCollapsiblePanel } from './collapsible-panel.js';

function renderMarkerDiagnostics(fieldPose) {
  if (!fieldPose.markerDiagnostics?.length) {
    return 'markers: unavailable';
  }

  return fieldPose.markerDiagnostics.map((marker) => {
    const axes = marker.axes || {};
    return [
      `${marker.id}: ${marker.visible ? 'visible' : 'missing'}`,
      `  pos ${formatVec3(marker.position)}`,
      `  rot ${formatVec3(marker.rotation || { x: 0, y: 0, z: 0 })}`,
      `  x ${formatVec3(axes.right)}`,
      `  y ${formatVec3(axes.up)}`,
      `  z ${formatVec3(axes.forward)}`
    ].join('\n');
  }).join('\n\n');
}

function formatUv(surfaceUv) {
  if (!surfaceUv) {
    return '(n/a)';
  }
  return `(${surfaceUv.u.toFixed(2)}, ${surfaceUv.v.toFixed(2)})`;
}

export function createDebugPanel(mode = 'debug') {
  const shell = createCollapsiblePanel({
    title: `Developer Panel | ${mode}`,
    side: 'right',
    width: '340px',
    defaultCollapsed: false
  });
  const { body: panel } = shell;

  const body = document.createElement('pre');
  body.style.margin = '0';
  body.style.whiteSpace = 'pre-wrap';
  body.style.fontFamily = 'inherit';
  panel.appendChild(body);

  return {
    render({ fieldPose, lightPose, objectPose, shadowProjection, debugState }) {
      body.textContent = [
        `plane solvable: ${formatBool(fieldPose.planeSolvable)}`,
        `field status: ${fieldPose.status}`,
        `layout quality: ${fieldPose.layoutQuality}`,
        `field origin: ${formatVec3(fieldPose.origin)}`,
        `field normal: ${formatVec3(fieldPose.normal)}`,
        `field size: ${fieldPose.width.toFixed(3)} x ${fieldPose.depth.toFixed(3)}`,
        `field confidence: ${fieldPose.confidence.toFixed(2)}`,
        `field visible markers: ${fieldPose.visibleMarkers?.join(', ') || 'none'}`,
        `field missing markers: ${fieldPose.missingMarkers?.join(', ') || 'none'}`,
        `rectangularity error: ${fieldPose.validation.rectangularityError.toFixed(3)}`,
        `fourth corner error: ${fieldPose.validation.fourthCornerError.toFixed(3)}`,
        `diagonal error: ${fieldPose.validation.diagonalError.toFixed(3)}`,
        `orthogonality error: ${fieldPose.validation.orthogonalityErrorDeg.toFixed(2)} deg`,
        `corner angle: ${fieldPose.validation.cornerAngleDeg.toFixed(2)} deg`,
        `marker normal avg drift: ${fieldPose.validation.markerNormalAlignmentDeg.toFixed(2)} deg`,
        `marker normal max drift: ${fieldPose.validation.markerNormalMaxDeviationDeg.toFixed(2)} deg`,
        `average marker normal: ${formatVec3(fieldPose.validation.averageMarkerNormal)}`,
        `expected se: ${formatVec3(fieldPose.validation.expectedCorners.se)}`,
        `validation warnings: ${fieldPose.validation.warnings.length ? fieldPose.validation.warnings.join(', ') : 'none'}`,
        `validation errors: ${fieldPose.validation.errors.length ? fieldPose.validation.errors.join(', ') : 'none'}`,
        '',
        renderMarkerDiagnostics(fieldPose),
        '',
        `light position: ${formatVec3(lightPose.position)}`,
        `light direction: ${formatVec3(lightPose.direction)}`,
        `light confidence: ${lightPose.confidence.toFixed(2)}`,
        '',
        `object position: ${formatVec3(objectPose.position)}`,
        `object anchor: ${formatVec3(objectPose.fieldAnchor)}`,
        `object surface uv: ${formatUv(objectPose.surfaceUv)}`,
        `object height above field: ${(objectPose.heightAboveField ?? 0).toFixed(3)}`,
        `object field status: ${objectPose.fieldStatus || 'unknown'}`,
        `object source: ${objectPose.source || 'unknown'}`,
        `object size: ${formatVec3(objectPose.size)}`,
        `object class: ${objectPose.className}`,
        `object confidence: ${objectPose.confidence.toFixed(2)}`,
        '',
        `shadow position: ${formatVec3(shadowProjection.position)}`,
        `shadow scale: ${formatVec3(shadowProjection.scale)}`,
        `shadow opacity: ${shadowProjection.opacity.toFixed(2)}`,
        `projection status: ${shadowProjection.status}`,
        `shadow confidence: ${shadowProjection.confidence.toFixed(2)}`,
        '',
        `markers visible: ${JSON.stringify(debugState.markerVisibility)}`,
        `toggles: ${JSON.stringify(debugState.toggles)}`,
        `errors: ${debugState.errors.length ? debugState.errors.join(', ') : 'none'}`
      ].join('\n');
    }
  };
}
