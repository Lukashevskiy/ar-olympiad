# Light Marker Spec

The light source is controlled by a dedicated marker:

- `light-main`

Recommended interpretation:

- marker world position maps to light position;
- marker local `-Z` or configurable axis can define emitted direction;
- `lightType` is either `point` or `directional`.

Debug expectations:

- render a label for the marker;
- render a ray or arrow for light direction;
- expose world position, direction, type, and confidence.
