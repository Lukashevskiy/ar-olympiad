export function createDebugView(root) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = '1fr 1fr';
  wrapper.style.minHeight = '100vh';
  root.appendChild(wrapper);

  const scene = document.createElement('div');
  scene.style.padding = '24px';
  scene.style.borderRight = '1px solid rgba(120, 140, 160, 0.2)';
  scene.style.background = 'linear-gradient(180deg, #111927 0%, #0b1016 100%)';
  wrapper.appendChild(scene);

  const panel = document.createElement('pre');
  panel.style.margin = '0';
  panel.style.padding = '24px';
  panel.style.whiteSpace = 'pre-wrap';
  panel.style.background = '#0b1016';
  wrapper.appendChild(panel);

  return {
    render(summary) {
      scene.innerHTML = `
        <h2>Debug Scene</h2>
        <p>Field valid: ${summary.fieldPose.isValid}</p>
        <p>Light: ${summary.lightPose.position.x.toFixed(2)}, ${summary.lightPose.position.y.toFixed(2)}, ${summary.lightPose.position.z.toFixed(2)}</p>
        <p>Object: ${summary.objectPose.position.x.toFixed(2)}, ${summary.objectPose.position.y.toFixed(2)}, ${summary.objectPose.position.z.toFixed(2)}</p>
        <p>Shadow status: ${summary.shadowProjection.status}</p>
        <p>Shadow point: ${summary.shadowProjection.position.x.toFixed(2)}, ${summary.shadowProjection.position.y.toFixed(2)}, ${summary.shadowProjection.position.z.toFixed(2)}</p>
      `;
      panel.textContent = JSON.stringify(summary, null, 2);
    }
  };
}
