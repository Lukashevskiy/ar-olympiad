export function createSummaryPanel(root) {
  const panel = document.createElement('pre');
  panel.style.margin = '0';
  panel.style.padding = '16px';
  panel.style.whiteSpace = 'pre-wrap';
  root.appendChild(panel);
  return {
    render(data) {
      panel.textContent = JSON.stringify(data, null, 2);
    }
  };
}
