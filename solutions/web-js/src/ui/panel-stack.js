const stacks = new Map();

function getKey(side) {
  return side || 'right';
}

export function reservePanelTop({
  side = 'right',
  start = 12,
  gap = 12,
  height = 320
}) {
  const key = getKey(side);
  const currentTop = stacks.has(key) ? stacks.get(key) : start;
  stacks.set(key, currentTop + height + gap);
  return `${currentTop}px`;
}

export function resetPanelStack(side) {
  if (side) {
    stacks.delete(getKey(side));
    return;
  }
  stacks.clear();
}
