export function createStatusOverlay(mode) {
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.top = '12px';
  panel.style.left = '12px';
  panel.style.padding = '10px 12px';
  panel.style.background = 'rgba(9, 13, 18, 0.78)';
  panel.style.border = '1px solid rgba(140, 160, 180, 0.25)';
  panel.style.color = '#e9f1f7';
  panel.style.fontSize = '12px';
  panel.style.zIndex = '10';

  const modeLine = document.createElement('div');
  modeLine.textContent = `Mode: ${mode}`;
  panel.appendChild(modeLine);

  const statusLine = document.createElement('div');
  panel.appendChild(statusLine);

  document.body.appendChild(panel);

  return {
    setMessage(message) {
      statusLine.textContent = `Status: ${message}`;
    }
  };
}
