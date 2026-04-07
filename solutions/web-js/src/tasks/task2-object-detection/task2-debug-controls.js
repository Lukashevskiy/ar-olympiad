import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function createNumberInput(value, onChange, { step = '0.01', min, max } = {}) {
  const input = document.createElement('input');
  input.type = 'number';
  input.step = step;
  input.value = String(value);
  if (min !== undefined) input.min = String(min);
  if (max !== undefined) input.max = String(max);
  input.style.width = '72px';
  input.style.padding = '4px';
  input.style.background = '#0f1720';
  input.style.border = '1px solid rgba(140, 160, 180, 0.25)';
  input.style.color = '#e7edf3';
  input.addEventListener('input', () => {
    const next = Number(input.value);
    if (!Number.isNaN(next)) {
      onChange(next);
    }
  });
  return input;
}

function createRow(labelText, input) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'space-between';
  row.style.gap = '8px';
  row.style.marginTop = '8px';

  const label = document.createElement('span');
  label.textContent = labelText;
  row.append(label, input);
  return row;
}

export function createTask2DebugControls(objectProvider, options = {}) {
  const shell = createCollapsiblePanel({
    title: options.title || 'Task 2 Object Controls',
    side: options.side || 'left',
    width: options.width || '300px',
    top: options.top || '430px',
    defaultCollapsed: options.defaultCollapsed ?? false
  });
  const { body: panel } = shell;
  const state = objectProvider.get();

  const hint = document.createElement('div');
  hint.textContent = 'Move the object inside the reconstructed field using surface coordinates and height above the field.';
  hint.style.margin = '0 0 10px';
  panel.appendChild(hint);

  panel.appendChild(createRow(
    'surface u',
    createNumberInput(state.surfaceUv.u, (next) => objectProvider.updateSurfaceUv({ u: next }), { min: 0, max: 1 })
  ));
  panel.appendChild(createRow(
    'surface v',
    createNumberInput(state.surfaceUv.v, (next) => objectProvider.updateSurfaceUv({ v: next }), { min: 0, max: 1 })
  ));
  panel.appendChild(createRow(
    'height',
    createNumberInput(state.heightAboveField, (next) => objectProvider.setHeightAboveField(next))
  ));

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `rotation ${axis}`,
      createNumberInput(state.rotation[axis], (next) => objectProvider.updateRotation({ [axis]: next }))
    ));
  });

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `size ${axis}`,
      createNumberInput(state.size[axis], (next) => objectProvider.updateSize({ [axis]: next }), { min: 0.01 })
    ));
  });

  panel.appendChild(createRow(
    'confidence',
    createNumberInput(state.confidence, (next) => objectProvider.setConfidence(next), { min: 0, max: 1, step: '0.05' })
  ));

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '12px';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.textContent = 'Reset';
  resetButton.style.padding = '6px 10px';
  resetButton.style.background = '#1f6feb';
  resetButton.style.color = '#ffffff';
  resetButton.style.border = 'none';
  resetButton.style.cursor = 'pointer';
  resetButton.addEventListener('click', () => {
    objectProvider.reset();
  });

  actions.appendChild(resetButton);
  panel.appendChild(actions);

  return shell.panel;
}
