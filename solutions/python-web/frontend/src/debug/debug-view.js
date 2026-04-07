export function createDebugView(root) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'grid';
  wrapper.style.gridTemplateColumns = 'minmax(480px, 1fr) 420px';
  wrapper.style.minHeight = '100vh';
  wrapper.style.paddingLeft = '356px';
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

  const previewWrapper = document.createElement('div');
  previewWrapper.style.position = 'relative';
  previewWrapper.style.marginTop = '16px';
  previewWrapper.style.width = 'min(100%, 720px)';
  previewWrapper.style.aspectRatio = '1 / 1';
  previewWrapper.style.background = '#111927';
  previewWrapper.style.border = '1px solid rgba(120, 140, 160, 0.25)';
  previewWrapper.style.borderRadius = '10px';
  previewWrapper.style.overflow = 'hidden';

  const preview = document.createElement('img');
  preview.style.width = '100%';
  preview.style.height = '100%';
  preview.style.objectFit = 'contain';
  preview.style.maxWidth = '100%';
  previewWrapper.appendChild(preview);

  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.setAttribute('viewBox', '0 0 100 100');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.pointerEvents = 'none';
  previewWrapper.appendChild(overlay);

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('fill', 'rgba(59, 130, 246, 0.18)');
  polygon.setAttribute('stroke', '#7dd3fc');
  polygon.setAttribute('stroke-width', '0.8');
  overlay.appendChild(polygon);

  scene.appendChild(previewWrapper);

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
    render(summary) {
      scene.innerHTML = `
        <h2>Debug Scene</h2>
        <p>Detector mode: ${summary.detectorMode}</p>
        <p>Field valid: ${summary.fieldPose.isValid}</p>
        <p>Light: ${summary.lightPose.position.x.toFixed(2)}, ${summary.lightPose.position.y.toFixed(2)}, ${summary.lightPose.position.z.toFixed(2)}</p>
        <p>Object class: ${summary.objectPose.className}</p>
        <p>Detection status: ${summary.objectPose.mask?.status || 'unknown'}</p>
        <p>Object: ${summary.objectPose.position.x.toFixed(2)}, ${summary.objectPose.position.y.toFixed(2)}, ${summary.objectPose.position.z.toFixed(2)}</p>
        <p>Shadow status: ${summary.shadowProjection.status}</p>
        <p>Shadow point: ${summary.shadowProjection.position.x.toFixed(2)}, ${summary.shadowProjection.position.y.toFixed(2)}, ${summary.shadowProjection.position.z.toFixed(2)}</p>
      `;
      scene.appendChild(previewWrapper);
      preview.src = summary.previewUrl || '';
      setFieldPolygon(summary.fieldImageCorners || []);
      panel.textContent = JSON.stringify(summary, null, 2);
    }
  };
}
