# Shadow Projection Math

Baseline MVP uses planar ray projection:

1. field plane is defined by origin `P0` and normal `N`;
2. shadow origin is a point on the object, normally object base center or centroid;
3. ray direction is computed from light position to object point for point lights, or from inverse light direction for directional lights;
4. plane intersection solves `P = R0 + t * Rd` where `dot(N, P - P0) = 0`;
5. if `dot(N, Rd)` is near zero, projection fails with status `parallel-ray`;
6. if `t < 0`, projection fails with status `behind-ray-origin`.

MVP shadow scale heuristic:

- use object height above the plane to stretch the shadow;
- increase scale with grazing angles;
- clamp to avoid exploding geometry in near-parallel cases.

Future extensions:

- contour projection per vertex;
- soft shadow opacity falloff;
- area-light approximation;
- segmentation mask projection.
