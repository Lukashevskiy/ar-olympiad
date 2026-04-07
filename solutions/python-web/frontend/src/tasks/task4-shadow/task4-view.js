export function createTask4View(root) {
  const summary = root.querySelector('#scene-summary');
  const panel = root.querySelector('#task4-json');
  const preview = root.querySelector('#frame-preview');
  const polygon = root.querySelector('#field-polygon');

  if (!summary || !panel || !preview || !polygon) {
    throw new Error('Task 4 HTML skeleton is incomplete');
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
        <p>Field status: ${state.fieldPose.status || 'unknown'}</p>
        <p>Field confidence: ${(state.fieldPose.confidence || 0).toFixed(2)}</p>
        <p>Light mode: ${state.lightPose.mode || state.lightPose.lightType}</p>
        <p>Light visible: ${state.lightPose.visible ?? true}</p>
        <p>Object captured: ${state.objectCaptured}</p>
        <p>Object class: ${state.objectPose.className}</p>
        <p>Shadow status: ${state.shadowProjection.status}</p>
        <p>Shadow opacity: ${state.shadowProjection.opacity.toFixed(2)}</p>
        <p>Shadow blur: ${(state.shadowProjection.blur || 0).toFixed(2)}</p>
        <p>Penumbra scale: ${(state.shadowProjection.penumbraScale || 1).toFixed(2)}</p>
        <p>Reflection opacity: ${(state.shadowProjection.reflectionOpacity || 0).toFixed(2)}</p>
      `;
      preview.src = state.previewUrl || '';
      setFieldPolygon(state.fieldImageCorners || []);
      panel.textContent = JSON.stringify(state, null, 2);
    }
  };
}
