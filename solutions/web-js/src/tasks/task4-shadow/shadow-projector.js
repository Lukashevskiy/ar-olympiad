import { projectShadow } from '../../math/projection.js';

export function createShadowProjector() {
  return {
    project(input) {
      return projectShadow(input);
    }
  };
}
