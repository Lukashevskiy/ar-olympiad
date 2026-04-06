export function createStatusOverlay(root) {
  const bar = document.createElement('div');
  bar.style.padding = '12px 16px';
  bar.style.borderBottom = '1px solid rgba(120, 140, 160, 0.2)';
  bar.style.background = '#121a23';
  root.appendChild(bar);
  return {
    set(text) {
      bar.textContent = text;
    }
  };
}
