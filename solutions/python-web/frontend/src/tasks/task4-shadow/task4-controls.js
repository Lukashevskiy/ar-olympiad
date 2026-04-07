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

export function createTask4Controls(root, handlers) {
  const status = root.querySelector('#controls-status');
  const body = root.querySelector('#controls-body');

  if (!status || !body) {
    throw new Error('Task 4 controls HTML skeleton is incomplete');
  }

  body.appendChild(createSectionTitle('Live Task 4'));
  ['Show the four field markers.', 'Show the light marker.', 'Place the ball inside the field, then capture the object.', 'After capture, the shadow updates as the light marker moves.']
    .forEach((text) => {
      const line = document.createElement('div');
      line.textContent = text;
      line.style.marginTop = '8px';
      body.appendChild(line);
    });

  body.appendChild(createButton('Capture Object + Start Shadow', '#238636', async () => {
    status.textContent = 'Capturing object and starting shadow tracking...';
    try {
      await handlers.onCapture();
      status.textContent = 'Object captured';
    } catch (error) {
      status.textContent = `Capture failed: ${error.message}`;
    }
  }));

  body.appendChild(createButton('Reproject Shadow Now', '#1f6feb', async () => {
    status.textContent = 'Reprojecting shadow...';
    try {
      await handlers.onReproject();
      status.textContent = 'Shadow updated';
    } catch (error) {
      status.textContent = `Shadow update failed: ${error.message}`;
    }
  }));

  return {
    setStatus(message) {
      status.textContent = message;
    }
  };
}
