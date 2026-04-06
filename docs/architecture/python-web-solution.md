# Python Web Solution

`solutions/python-web` separates scene rendering from backend inference and projection services.

## Backend

FastAPI exposes:

- `GET /health`
- `POST /api/detect/object`
- `POST /api/project/shadow`

The backend currently returns mock but schema-compatible payloads. The service split leaves clear extension points for segmentation, contour extraction, and more advanced shadow models.

## Frontend

The frontend is a small JS application that:

- reconstructs field and light state locally;
- calls backend endpoints for object detection and shadow projection;
- renders debug overlays and scene summaries;
- provides a debug entrypoint for mock payload exploration without camera input.

## Debug stance

Even in the Python-backed variant, debug mode remains first-class. It is used to inspect request payloads, API responses, projected shadow state, and local field geometry before real CV integration.
