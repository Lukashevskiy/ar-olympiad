export function createDebugGrid(target) {
  const root = document.createElement('a-entity');
  const size = 2;
  const step = 0.2;

  for (let value = -size; value <= size + 1e-6; value += step) {
    const horizontal = document.createElement('a-entity');
    horizontal.setAttribute(
      'line',
      `start: ${-size} 0 ${value.toFixed(2)}; end: ${size} 0 ${value.toFixed(2)}; color: #2f3e4d`
    );
    root.appendChild(horizontal);

    const vertical = document.createElement('a-entity');
    vertical.setAttribute(
      'line',
      `start: ${value.toFixed(2)} 0 ${-size}; end: ${value.toFixed(2)} 0 ${size}; color: #2f3e4d`
    );
    root.appendChild(vertical);
  }

  target.appendChild(root);
  return root;
}
