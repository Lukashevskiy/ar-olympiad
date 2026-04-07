function createNumberInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.01';
  input.min = '0';
  input.max = '1';
  input.value = String(value);
  input.style.width = '72px';
  input.style.padding = '4px 6px';
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

function createRow(labelText, control) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'space-between';
  row.style.gap = '8px';
  row.style.marginTop = '8px';

  const label = document.createElement('span');
  label.textContent = labelText;
  row.append(label, control);
  return row;
}

function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.margin = '14px 0 8px';
  title.style.fontWeight = '700';
  title.style.color = '#8bd5ff';
  return title;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function createDetectionDebugControls(root, initialState, handlers) {
  const panel = document.createElement('section');
  panel.style.position = 'fixed';
  panel.style.top = '12px';
  panel.style.left = '12px';
  panel.style.width = '320px';
  panel.style.maxHeight = 'calc(100vh - 24px)';
  panel.style.overflow = 'auto';
  panel.style.padding = '12px';
  panel.style.background = 'rgba(10, 14, 20, 0.92)';
  panel.style.border = '1px solid rgba(110, 130, 150, 0.35)';
  panel.style.borderRadius = '10px';
  panel.style.color = '#e6edf3';
  panel.style.fontSize = '12px';
  panel.style.lineHeight = '1.45';
  panel.style.zIndex = '30';

  const title = document.createElement('div');
  title.textContent = 'Ball Detection Workbench';
  title.style.fontWeight = '700';
  panel.appendChild(title);

  const hint = document.createElement('div');
  hint.textContent = 'Upload a real frame or use the synthetic frame, then set field corners and run detection inside the field polygon.';
  hint.style.margin = '8px 0 10px';
  hint.style.opacity = '0.9';
  panel.appendChild(hint);

  const status = document.createElement('div');
  status.style.marginBottom = '10px';
  status.style.color = '#a7f3d0';
  panel.appendChild(status);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.width = '100%';
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }
    status.textContent = 'Loading image...';
    try {
      const imageBase64 = await fileToDataUrl(file);
      handlers.onImageSelected({
        imageBase64,
        previewUrl: imageBase64,
        filename: file.name
      });
      status.textContent = `Loaded: ${file.name}`;
    } catch (error) {
      status.textContent = `Image load failed: ${error.message}`;
    }
  });

  panel.appendChild(createSectionTitle('Frame'));
  panel.appendChild(fileInput);

  const syntheticButton = document.createElement('button');
  syntheticButton.type = 'button';
  syntheticButton.textContent = 'Use Synthetic Frame';
  syntheticButton.style.marginTop = '10px';
  syntheticButton.style.padding = '6px 10px';
  syntheticButton.style.background = '#1f6feb';
  syntheticButton.style.color = '#ffffff';
  syntheticButton.style.border = 'none';
  syntheticButton.style.cursor = 'pointer';
  syntheticButton.addEventListener('click', () => {
    handlers.onUseSynthetic();
    status.textContent = 'Synthetic frame restored';
  });
  panel.appendChild(syntheticButton);

  panel.appendChild(createSectionTitle('Field Image Corners'));
  const cornerInputs = {};
  Object.entries(initialState.fieldImageCorners).forEach(([cornerId, corner]) => {
    cornerInputs[cornerId] = {};
    panel.appendChild(createSectionTitle(cornerId));
    const xInput = createNumberInput(corner.x, (next) => handlers.onCornerChange(cornerId, 'x', next));
    const yInput = createNumberInput(corner.y, (next) => handlers.onCornerChange(cornerId, 'y', next));
    cornerInputs[cornerId].x = xInput;
    cornerInputs[cornerId].y = yInput;
    panel.appendChild(createRow(
      `${cornerId}.x`,
      xInput
    ));
    panel.appendChild(createRow(
      `${cornerId}.y`,
      yInput
    ));
  });

  const runButton = document.createElement('button');
  runButton.type = 'button';
  runButton.textContent = 'Run Ball Detection';
  runButton.style.marginTop = '16px';
  runButton.style.padding = '8px 12px';
  runButton.style.background = '#238636';
  runButton.style.color = '#ffffff';
  runButton.style.border = 'none';
  runButton.style.cursor = 'pointer';
  runButton.addEventListener('click', async () => {
    status.textContent = 'Running detection...';
    try {
      await handlers.onRun();
      status.textContent = 'Detection completed';
    } catch (error) {
      status.textContent = `Detection failed: ${error.message}`;
    }
  });
  panel.appendChild(runButton);

  root.appendChild(panel);

  return {
    setStatus(message) {
      status.textContent = message;
    },
    syncFieldImageCorners(fieldImageCorners) {
      Object.entries(fieldImageCorners).forEach(([cornerId, corner]) => {
        if (!cornerInputs[cornerId]) {
          return;
        }
        cornerInputs[cornerId].x.value = String(corner.x);
        cornerInputs[cornerId].y.value = String(corner.y);
      });
    }
  };
}
