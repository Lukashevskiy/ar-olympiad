# Debug Mode Spec

Debug mode is a camera-free engineering environment.

## Modes

- `ar`: live marker / camera mode.
- `debug`: synthetic scene mode with configurable entities.

## Manual controls

The developer can move:

- four field markers;
- field plane rotation indirectly through markers;
- light position and optional direction;
- object position, rotation, and size.

## Required gizmos

- `marker-gizmos`
- `field-gizmos`
- `light-gizmos`
- `object-gizmos`
- `shadow-gizmos`
- `debug-grid`
- `debug-panel`

## Required displayed values

- marker visibility and world coordinates;
- marker local axes and normals;
- edge distances and rectangle validity;
- field width, depth, normal, confidence, and `isValid`;
- light position, direction, type, and confidence;
- object position, height above field, class, size, and confidence;
- shadow position, scale, opacity, projection status, and confidence;
- projection error reason when the shadow cannot be built.

## Toggle model

Each helper must be individually switchable so the same scene can be used for:

- clean demo view;
- geometry debugging;
- projection troubleshooting.
