export function createTask3View(root) {
  const summary = root.querySelector('#scene-summary');
  const panel = root.querySelector('#task3-json');

  if (!summary || !panel) {
    throw new Error('Task 3 HTML skeleton is incomplete');
  }

  return {
    render(state) {
      summary.innerHTML = `
        <p>Mode: ${state.mode}</p>
        <p>Light marker visible: ${state.visible}</p>
        <p>Light type: ${state.lightType}</p>
        <p>Intensity: ${state.intensity.toFixed(2)}</p>
        <p>Marker id: ${state.markerId}</p>
        <p>Position: ${state.position.x.toFixed(2)}, ${state.position.y.toFixed(2)}, ${state.position.z.toFixed(2)}</p>
        <p>Direction: ${state.direction.x.toFixed(2)}, ${state.direction.y.toFixed(2)}, ${state.direction.z.toFixed(2)}</p>
        <p>Confidence: ${state.confidence.toFixed(2)}</p>
      `;
      panel.textContent = JSON.stringify(state, null, 2);
    }
  };
}
