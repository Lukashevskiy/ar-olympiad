# Field Markers Spec

Field reconstruction uses four markers:

- `field-nw`
- `field-ne`
- `field-se`
- `field-sw`

Requirements:

- markers should be placed on the same physical plane;
- layout is expected to approximate a rectangle;
- clockwise ordering must be stable;
- confidence should degrade when one or more markers are missing or rectangle error exceeds threshold.

Validation outputs:

- marker visibility map;
- edge lengths;
- diagonal lengths;
- rectangularity error;
- expected vs actual fourth-corner delta;
- plane normal and local axes.
