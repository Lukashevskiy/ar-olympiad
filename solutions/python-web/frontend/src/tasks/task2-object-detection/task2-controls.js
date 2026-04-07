function createSectionTitle(text) {
  const title = document.createElement('div');
  title.textContent = text;
  title.style.margin = '14px 0 8px';
  title.style.fontWeight = '700';
  title.style.color = '#8bd5ff';
  return title;
}

function createButton(text, color, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.style.marginTop = '10px';
  button.style.padding = '8px 12px';
  button.style.background = color;
  button.style.color = '#ffffff';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.addEventListener('click', onClick);
  return button;
}

function createInfoLine(label) {
  const line = document.createElement('div');
  line.style.marginTop = '8px';
  line.textContent = label;
  return line;
}

export function createTask2Controls(root, handlers) {
  const panel = root.querySelector('#controls-panel');
  const status = root.querySelector('#controls-status');
  const body = root.querySelector('#controls-body');

  if (!panel || !status || !body) {
    throw new Error('Task 2 controls HTML skeleton is incomplete');
  }

  body.appendChild(createSectionTitle('Live Task 2'));
  body.appendChild(createInfoLine('1. Point the camera at the four field markers.'));
  body.appendChild(createInfoLine('2. Keep the ball inside the field.'));
  body.appendChild(createInfoLine('3. Press capture when the field becomes valid.'));
  body.appendChild(createButton('Capture + Detect Ball', '#238636', async () => {
    status.textContent = 'Capturing frame and running detection...';
    try {
      await handlers.onDetect();
      status.textContent = 'Detection completed';
    } catch (error) {
      status.textContent = `Detection failed: ${error.message}`;
    }
  }));

  return {
    setStatus(message) {
      status.textContent = message;
    }
  };
}
