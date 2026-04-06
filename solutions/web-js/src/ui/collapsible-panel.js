function applyPanelBaseStyle(panel, side, width, top) {
  panel.style.position = 'fixed';
  panel.style.top = top;
  panel.style[side] = '12px';
  panel.style.width = width;
  panel.style.maxHeight = 'calc(100vh - 24px)';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.background = 'rgba(10, 14, 20, 0.9)';
  panel.style.border = '1px solid rgba(110, 130, 150, 0.35)';
  panel.style.color = '#e6edf3';
  panel.style.fontSize = '12px';
  panel.style.lineHeight = '1.45';
  panel.style.zIndex = '20';
  panel.style.borderRadius = '10px';
  panel.style.overflow = 'hidden';
  panel.style.backdropFilter = 'blur(8px)';
}

export function createCollapsiblePanel({
  title,
  side = 'right',
  width = '320px',
  top = '12px',
  defaultCollapsed = false
}) {
  const panel = document.createElement('section');
  applyPanelBaseStyle(panel, side, width, top);

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '10px 12px';
  header.style.borderBottom = '1px solid rgba(110, 130, 150, 0.22)';
  header.style.background = 'rgba(255, 255, 255, 0.03)';

  const titleElement = document.createElement('div');
  titleElement.textContent = title;
  titleElement.style.fontWeight = '700';
  header.appendChild(titleElement);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.style.border = 'none';
  toggle.style.background = 'transparent';
  toggle.style.color = '#e6edf3';
  toggle.style.cursor = 'pointer';
  toggle.style.font = 'inherit';
  toggle.style.padding = '0';
  header.appendChild(toggle);

  const body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflow = 'auto';

  panel.append(header, body);
  document.body.appendChild(panel);

  let collapsed = defaultCollapsed;

  function syncCollapsedState() {
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? 'Expand' : 'Collapse';
  }

  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    syncCollapsedState();
  });

  syncCollapsedState();

  return {
    panel,
    body,
    setCollapsed(nextCollapsed) {
      collapsed = nextCollapsed;
      syncCollapsedState();
    }
  };
}
