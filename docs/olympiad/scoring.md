# Scoring

Suggested scoring split:

- `Task 1 - Field`: 30%
  - stable reconstruction from four markers;
  - validation of rectangle layout;
  - correct plane axes and surface transforms.
- `Task 2 - Object Detection`: 20%
  - object localization inside the field;
  - confidence reporting;
  - clear API / interface for future CV improvements.
- `Task 3 - Light`: 20%
  - separate light marker tracking;
  - usable light pose estimate;
  - readable failure handling when light is unavailable.
- `Task 4 - Shadow`: 20%
  - correct ray-plane projection;
  - stable visualization on the field;
  - graceful handling of impossible projections.
- `Debug / Developer Experience`: 10%
  - camera-free mode;
  - numerical overlays;
  - gizmos for geometry inspection and error diagnosis.
