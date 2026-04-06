export function buildShadowMaterial(shadowProjection) {
  return {
    color: '#111111',
    opacity: shadowProjection.opacity,
    transparent: true
  };
}
