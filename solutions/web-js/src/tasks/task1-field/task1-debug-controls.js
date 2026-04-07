import { createCollapsiblePanel } from '../../ui/collapsible-panel.js';

function createNumberInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.01';
  input.value = String(value);
  input.style.width = '64px';
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

function createAxisRow(markerId, axis, value, onChange) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '8px';
  wrapper.style.marginTop = '6px';

  const label = document.createElement('span');
  label.textContent = `${markerId} ${axis}`;
  label.style.display = 'inline-block';
  label.style.width = '76px';
  wrapper.appendChild(label);
  wrapper.appendChild(createNumberInput(value, onChange));
  return wrapper;
}

export function createTask1DebugControls(markers, options = {}) {
  const shell = createCollapsiblePanel({
    title: options.title || 'Task 1 Marker Controls',
    side: options.side || 'left',
    width: options.width || '300px',
    top: options.top || '12px',
    defaultCollapsed: options.defaultCollapsed ?? false
  });
  const { body: panel } = shell;

  const hint = document.createElement('div');
  hint.textContent = 'Move marker coordinates, rotate marker normals, and toggle visibility to inspect plane reconstruction.';
  hint.style.margin = '8px 0 10px';
  panel.appendChild(hint);

  const cameraHint = document.createElement('div');
  cameraHint.textContent = 'Camera: drag mouse to look around, use W/A/S/D to move.';
  cameraHint.style.margin = '0 0 10px';
  cameraHint.style.opacity = '0.85';
  panel.appendChild(cameraHint);

  Object.entries(markers.getAll()).forEach(([markerId, marker]) => {
    const section = document.createElement('div');
    section.style.padding = '8px 0';
    section.style.borderTop = '1px solid rgba(140, 160, 180, 0.12)';

    const head = document.createElement('div');
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';

    const name = document.createElement('strong');
    name.textContent = markerId;
    head.appendChild(name);

    const visibleLabel = document.createElement('label');
    visibleLabel.style.display = 'flex';
    visibleLabel.style.alignItems = 'center';
    visibleLabel.style.gap = '6px';
    const visibleInput = document.createElement('input');
    visibleInput.type = 'checkbox';
    visibleInput.checked = marker.visible;
    visibleInput.addEventListener('change', () => {
      markers.setVisible(markerId, visibleInput.checked);
    });
    visibleLabel.appendChild(visibleInput);
    visibleLabel.append('visible');
    head.appendChild(visibleLabel);

    section.appendChild(head);

    ['x', 'y', 'z'].forEach((axis) => {
      section.appendChild(
        createAxisRow(markerId, axis, marker.position[axis], (nextValue) => {
          markers.updatePosition(markerId, { [axis]: nextValue });
        })
      );
    });

    const rotationTitle = document.createElement('div');
    rotationTitle.textContent = 'rotation (deg)';
    rotationTitle.style.marginTop = '8px';
    rotationTitle.style.opacity = '0.85';
    section.appendChild(rotationTitle);

    ['x', 'y', 'z'].forEach((axis) => {
      section.appendChild(
        createAxisRow(`${markerId} r`, axis, marker.rotation?.[axis] || 0, (nextValue) => {
          markers.updateRotation(markerId, { [axis]: nextValue });
        })
      );
    });

    panel.appendChild(section);
  });

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '12px';

  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset';
  resetButton.style.padding = '6px 10px';
  resetButton.style.background = '#1f6feb';
  resetButton.style.color = '#ffffff';
  resetButton.style.border = 'none';
  resetButton.style.cursor = 'pointer';
  resetButton.addEventListener('click', () => {
    markers.reset();
  });
  actions.appendChild(resetButton);

  panel.appendChild(actions);

  return shell.panel;
}
