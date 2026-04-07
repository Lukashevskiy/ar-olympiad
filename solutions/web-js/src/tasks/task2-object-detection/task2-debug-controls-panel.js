import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.margin = '14px 0 8px';
  title.style.fontWeight = '700';
  title.style.color = '#8bd5ff';
  return title;
}

function createHint(text) {
  const hint = document.createElement('div');
  hint.textContent = text;
  hint.style.margin = '0 0 8px';
  hint.style.opacity = '0.88';
  return hint;
}

function createNumberInput(value, onChange, { step = '0.01', min, max, width = '72px' } = {}) {
  const input = document.createElement('input');
  input.type = 'number';
  input.step = step;
  input.value = String(value);
  if (min !== undefined) input.min = String(min);
  if (max !== undefined) input.max = String(max);
  input.style.width = width;
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

function createCheckboxRow(labelText, checked, onChange) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  return createRow(labelText, input);
}

function appendMarkerSection(panel, markers, markerId, marker) {
  panel.appendChild(createSectionTitle(markerId));
  panel.appendChild(createCheckboxRow('visible', marker.visible, (next) => {
    markers.setVisible(markerId, next);
  }));

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `position ${axis}`,
      createNumberInput(marker.position[axis], (next) => {
        markers.updatePosition(markerId, { [axis]: next });
      })
    ));
  });

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `rotation ${axis}`,
      createNumberInput(marker.rotation?.[axis] || 0, (next) => {
        markers.updateRotation(markerId, { [axis]: next });
      })
    ));
  });
}

export function createTask2DebugControlsPanel(markers, objectProvider) {
  const shell = createCollapsiblePanel({
    title: 'Task 2 Debug Controls',
    side: 'left',
    width: '320px',
    top: '64px',
    defaultCollapsed: false
  });
  const { body: panel } = shell;

  panel.appendChild(createHint('Camera: drag mouse to look around, use W/A/S/D to move.'));
  panel.appendChild(createHint('Field markers and object are edited from one panel to avoid overlapping sidebars.'));

  panel.appendChild(createSectionTitle('Field Markers'));
  Object.entries(markers.getAll()).forEach(([markerId, marker]) => {
    appendMarkerSection(panel, markers, markerId, marker);
  });

  const objectState = objectProvider.get();
  panel.appendChild(createSectionTitle('Object Pose'));
  panel.appendChild(createRow(
    'surface u',
    createNumberInput(objectState.surfaceUv.u, (next) => objectProvider.updateSurfaceUv({ u: next }), { min: 0, max: 1 })
  ));
  panel.appendChild(createRow(
    'surface v',
    createNumberInput(objectState.surfaceUv.v, (next) => objectProvider.updateSurfaceUv({ v: next }), { min: 0, max: 1 })
  ));
  panel.appendChild(createRow(
    'height',
    createNumberInput(objectState.heightAboveField, (next) => objectProvider.setHeightAboveField(next))
  ));

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `rotation ${axis}`,
      createNumberInput(objectState.rotation[axis], (next) => objectProvider.updateRotation({ [axis]: next }))
    ));
  });

  ['x', 'y', 'z'].forEach((axis) => {
    panel.appendChild(createRow(
      `size ${axis}`,
      createNumberInput(objectState.size[axis], (next) => objectProvider.updateSize({ [axis]: next }), { min: 0.01 })
    ));
  });

  panel.appendChild(createRow(
    'confidence',
    createNumberInput(objectState.confidence, (next) => objectProvider.setConfidence(next), {
      min: 0,
      max: 1,
      step: '0.05'
    })
  ));

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '14px';

  const resetMarkersButton = document.createElement('button');
  resetMarkersButton.type = 'button';
  resetMarkersButton.textContent = 'Reset Field';
  resetMarkersButton.style.padding = '6px 10px';
  resetMarkersButton.style.background = '#1f6feb';
  resetMarkersButton.style.color = '#ffffff';
  resetMarkersButton.style.border = 'none';
  resetMarkersButton.style.cursor = 'pointer';
  resetMarkersButton.addEventListener('click', () => markers.reset());

  const resetObjectButton = document.createElement('button');
  resetObjectButton.type = 'button';
  resetObjectButton.textContent = 'Reset Object';
  resetObjectButton.style.padding = '6px 10px';
  resetObjectButton.style.background = '#238636';
  resetObjectButton.style.color = '#ffffff';
  resetObjectButton.style.border = 'none';
  resetObjectButton.style.cursor = 'pointer';
  resetObjectButton.addEventListener('click', () => objectProvider.reset());

  actions.append(resetMarkersButton, resetObjectButton);
  panel.appendChild(actions);

  return shell.panel;
}
