export function createTask2View(root) {
  const scene = root.querySelector('#task2-scene');
  const summary = root.querySelector('#scene-summary');
  const panel = root.querySelector('#task2-json');
  const preview = root.querySelector('#frame-preview');
  const polygon = root.querySelector('#field-polygon');

  if (!scene || !summary || !panel || !preview || !polygon) {
    throw new Error('Task 2 HTML skeleton is incomplete');
  }

  function setFieldPolygon(fieldImageCorners) {
    if (!fieldImageCorners?.length) {
      polygon.setAttribute('points', '');
      return;
    }

    const points = fieldImageCorners
      .map((corner) => `${(corner.x * 100).toFixed(2)},${(corner.y * 100).toFixed(2)}`)
      .join(' ');

    polygon.setAttribute('points', points);
  }

  return {
    render(state) {
      summary.innerHTML = `
        <p>Mode: ${state.mode}</p>
        <p>Field status: ${state.fieldPose.status || (state.fieldPose.isValid ? 'layout-good' : 'invalid')}</p>
        <p>Field confidence: ${(state.fieldPose.confidence || 0).toFixed(2)}</p>
        <p>Visible markers: ${(state.fieldPose.visibleMarkers || []).join(', ') || 'none'}</p>
        <p>Light: ${state.lightPose.position.x.toFixed(2)}, ${state.lightPose.position.y.toFixed(2)}, ${state.lightPose.position.z.toFixed(2)}</p>
        <p>Object class: ${state.objectPose.className}</p>
        <p>Detection status: ${state.objectPose.mask?.status || state.detectionStatus || 'waiting'}</p>
        <p>Object: ${state.objectPose.position.x.toFixed(2)}, ${state.objectPose.position.y.toFixed(2)}, ${state.objectPose.position.z.toFixed(2)}</p>
        <p>Shadow status: ${state.shadowProjection.status}</p>
        <p>Shadow point: ${state.shadowProjection.position.x.toFixed(2)}, ${state.shadowProjection.position.y.toFixed(2)}, ${state.shadowProjection.position.z.toFixed(2)}</p>
      `;
      preview.src = state.previewUrl || '';
      setFieldPolygon(state.fieldImageCorners || []);
      panel.textContent = JSON.stringify(state, null, 2);
    }
  };
}
