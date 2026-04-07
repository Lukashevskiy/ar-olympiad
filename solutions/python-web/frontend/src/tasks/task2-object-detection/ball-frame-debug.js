export function createSyntheticBallFrame({
  width = 640,
  height = 640,
  center = { u: 0.58, v: 0.46 },
  radius = 56
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#223246';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#6ee7ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  const cx = center.u * width;
  const cy = center.v * height;

  const gradient = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.2, cx, cy, radius);
  gradient.addColorStop(0, '#ffd4b3');
  gradient.addColorStop(0.35, '#ff8a3d');
  gradient.addColorStop(1, '#c63f00');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  return {
    imageBase64: canvas.toDataURL('image/png'),
    previewUrl: canvas.toDataURL('image/png'),
    fieldImageCorners: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 },
      { x: 0, y: 1, z: 0 }
    ],
    width,
    height,
    center,
    radius
  };
}
