import { getSurfaceTransform } from '../tasks/task1-field/field-transform-service.js';

function createLineEntity(root) {
  const line = document.createElement('a-entity');
  root.appendChild(line);
  return line;
}

function setLine(element, start, end, color) {
  element.setAttribute(
    'line',
    `start: ${start.x} ${start.y} ${start.z}; end: ${end.x} ${end.y} ${end.z}; color: ${color}`
  );
}

function createLabelEntity(root, scale = '0.45 0.45 0.45') {
  const label = document.createElement('a-text');
  label.setAttribute('scale', scale);
  root.appendChild(label);
  return label;
}

function setLabel(element, text, position, color = '#ffffff') {
  element.setAttribute('value', text);
  element.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
  element.setAttribute('color', color);
}

function getFieldColor(fieldPose) {
  if (!fieldPose.planeSolvable) {
    return '#ff5f56';
  }
  if (fieldPose.layoutQuality === 'distorted') {
    return '#ffbd2e';
  }
  return '#3aa1ff';
}

function getConfidenceOpacity(confidence, min = 0.14, max = 0.38) {
  return (min + (max - min) * Math.max(0, Math.min(1, confidence))).toFixed(3);
}

function getOutlineColor(fieldPose) {
  if (!fieldPose.planeSolvable) {
    return fieldPose.confidence < 0.25 ? '#ff8a80' : '#ff5f56';
  }
  if (fieldPose.layoutQuality === 'distorted') {
    return fieldPose.confidence < 0.65 ? '#ffd166' : '#ffbd2e';
  }
  return fieldPose.confidence > 0.85 ? '#7dd3fc' : '#4db6ff';
}

function getDiagnosticColor(fieldPose) {
  if (!fieldPose.planeSolvable) {
    return '#ff5f56';
  }
  return fieldPose.layoutQuality === 'distorted' ? '#ffbd2e' : '#3ddc97';
}

function sampleGridPoint(fieldPose, u, v) {
  return getSurfaceTransform(fieldPose, u, v).position;
}

export function createFieldGizmosUpdater(target) {
  const root = document.createElement('a-entity');
  const outline = Array.from({ length: 4 }, () => createLineEntity(root));
  const diagonals = Array.from({ length: 2 }, () => createLineEntity(root));
  const gridLines = Array.from({ length: 60 }, () => createLineEntity(root));
  const normal = createLineEntity(root);
  const right = createLineEntity(root);
  const forward = createLineEntity(root);
  const expectedLine = createLineEntity(root);
  const cornerLabels = Array.from({ length: 4 }, () => createLabelEntity(root));
  const expectedLabel = createLabelEntity(root);
  const statusLabel = createLabelEntity(root);
  const confidenceLabel = createLabelEntity(root);
  target.appendChild(root);

  return {
    update(fieldPose) {
      const hasCorners = !!fieldPose.corners.length;
      root.object3D.visible = hasCorners;
      if (!hasCorners) {
        return;
      }

      const outlineColor = getOutlineColor(fieldPose);
      const fieldColor = getFieldColor(fieldPose);
      const diagnosticColor = getDiagnosticColor(fieldPose);

      const edgePoints = [
        [sampleGridPoint(fieldPose, 0, 0), sampleGridPoint(fieldPose, 1, 0)],
        [sampleGridPoint(fieldPose, 1, 0), sampleGridPoint(fieldPose, 1, 1)],
        [sampleGridPoint(fieldPose, 1, 1), sampleGridPoint(fieldPose, 0, 1)],
        [sampleGridPoint(fieldPose, 0, 1), sampleGridPoint(fieldPose, 0, 0)]
      ];
      outline.forEach((line, index) => {
        setLine(line, edgePoints[index][0], edgePoints[index][1], outlineColor);
      });

      setLine(diagonals[0], sampleGridPoint(fieldPose, 0, 0), sampleGridPoint(fieldPose, 1, 1), '#2d5b73');
      setLine(diagonals[1], sampleGridPoint(fieldPose, 1, 0), sampleGridPoint(fieldPose, 0, 1), '#2d5b73');

      const subdivisions = 6;
      let gridIndex = 0;
      for (let index = 1; index < subdivisions; index += 1) {
        const t = index / subdivisions;
        const rowPoints = [];
        const columnPoints = [];
        for (let step = 0; step <= subdivisions; step += 1) {
          const p = step / subdivisions;
          rowPoints.push(sampleGridPoint(fieldPose, p, t));
          columnPoints.push(sampleGridPoint(fieldPose, t, p));
        }
        for (let step = 0; step < rowPoints.length - 1; step += 1) {
          setLine(gridLines[gridIndex], rowPoints[step], rowPoints[step + 1], '#28445a');
          gridIndex += 1;
          setLine(gridLines[gridIndex], columnPoints[step], columnPoints[step + 1], '#28445a');
          gridIndex += 1;
        }
      }
      for (; gridIndex < gridLines.length; gridIndex += 1) {
        gridLines[gridIndex].setAttribute('line', 'start: 0 0 0; end: 0 0 0; color: transparent');
      }

      setLine(
        normal,
        fieldPose.origin,
        {
          x: fieldPose.origin.x + fieldPose.normal.x * 0.3,
          y: fieldPose.origin.y + fieldPose.normal.y * 0.3,
          z: fieldPose.origin.z + fieldPose.normal.z * 0.3
        },
        '#55ff55'
      );
      setLine(
        right,
        fieldPose.origin,
        {
          x: fieldPose.origin.x + fieldPose.axes.right.x * 0.35,
          y: fieldPose.origin.y + fieldPose.axes.right.y * 0.35,
          z: fieldPose.origin.z + fieldPose.axes.right.z * 0.35
        },
        '#ff5555'
      );
      setLine(
        forward,
        fieldPose.origin,
        {
          x: fieldPose.origin.x + fieldPose.axes.forward.x * 0.35,
          y: fieldPose.origin.y + fieldPose.axes.forward.y * 0.35,
          z: fieldPose.origin.z + fieldPose.axes.forward.z * 0.35
        },
        '#5599ff'
      );

      fieldPose.corners.forEach((corner, index) => {
        setLabel(cornerLabels[index], corner.id, { x: corner.x, y: corner.y + 0.03, z: corner.z }, '#d9f1ff');
      });

      const expectedSe = fieldPose.validation.expectedCorners.se;
      const actualSe = fieldPose.corners.find((corner) => corner.id === 'field-se');
      setLabel(expectedLabel, 'expected-se', { x: expectedSe.x, y: expectedSe.y + 0.05, z: expectedSe.z }, '#ff9f43');
      setLine(
        expectedLine,
        expectedSe,
        actualSe,
        fieldPose.validation.fourthCornerError < 0.08 ? diagnosticColor : '#ff9f43'
      );

      setLabel(statusLabel, fieldPose.status, { x: fieldPose.origin.x, y: fieldPose.origin.y + 0.08, z: fieldPose.origin.z }, fieldColor);
      setLabel(
        confidenceLabel,
        `confidence ${Math.round(fieldPose.confidence * 100)}%`,
        { x: fieldPose.origin.x, y: fieldPose.origin.y + 0.13, z: fieldPose.origin.z },
        outlineColor
      );

      root.setAttribute('material', `opacity: ${getConfidenceOpacity(fieldPose.confidence)}`);
    },
    root
  };
}

export function createFieldGizmos(scene, fieldPose) {
  const updater = createFieldGizmosUpdater(scene);
  updater.update(fieldPose);
  return updater.root;
}
