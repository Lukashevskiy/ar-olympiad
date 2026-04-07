function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.margin = '14px 0 8px';
  title.style.fontWeight = '700';
  title.style.color = '#8bd5ff';
  return title;
}

function createModeSelect(value, onChange) {
  const select = document.createElement('select');
  select.style.width = '100%';
  select.style.padding = '6px 8px';
  select.style.background = '#0f1720';
  select.style.border = '1px solid rgba(140, 160, 180, 0.25)';
  select.style.color = '#e7edf3';

  [
    { value: 'ambient', label: 'Ambient / diffuse' },
    { value: 'directional-fixed', label: 'Directional fixed' },
    { value: 'directional-marker', label: 'Directional by marker rotation' }
  ].forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    option.selected = optionData.value === value;
    select.appendChild(option);
  });

  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function createRangeInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '1.5';
  input.step = '0.05';
  input.value = String(value);
  input.style.width = '100%';
  input.addEventListener('input', () => onChange(Number(input.value)));
  return input;
}

export function createTask3Controls(root, state, handlers) {
  const status = root.querySelector('#controls-status');
  const body = root.querySelector('#controls-body');

  if (!status || !body) {
    throw new Error('Task 3 controls HTML skeleton is incomplete');
  }

  body.appendChild(createSectionTitle('Lighting Mode'));
  body.appendChild(createModeSelect(state.mode, handlers.onModeChange));

  body.appendChild(createSectionTitle('Intensity'));
  const intensityValue = document.createElement('div');
  intensityValue.textContent = state.intensity.toFixed(2);
  intensityValue.style.marginBottom = '6px';
  body.appendChild(intensityValue);
  body.appendChild(createRangeInput(state.intensity, (next) => {
    intensityValue.textContent = next.toFixed(2);
    handlers.onIntensityChange(next);
  }));

  body.appendChild(createSectionTitle('Usage'));
  ['Show the light marker to the camera.', 'Switch modes to compare light behavior.', 'Observe marker position, direction, and preview lighting.']
    .forEach((text) => {
      const line = document.createElement('div');
      line.textContent = text;
      line.style.marginTop = '8px';
      body.appendChild(line);
    });

  return {
    setStatus(message) {
      status.textContent = message;
    }
  };
}
