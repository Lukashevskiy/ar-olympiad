export function formatVec3(v) {
  if (!v) return 'n/a';
  return `${v.x.toFixed(3)}, ${v.y.toFixed(3)}, ${v.z.toFixed(3)}`;
}

export function formatBool(value) {
  return value ? 'yes' : 'no';
}

export function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}
