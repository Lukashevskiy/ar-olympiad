function setLine(element, end, color) {
  element.setAttribute('line', `start: 0 0 0; end: ${end.x} ${end.y} ${end.z}; color: ${color}`);
}

function offsetFromAxis(axis, length = 0.15) {
  const basis = axis || { x: 0, y: 1, z: 0 };
  return {
    x: basis.x * length,
    y: basis.y * length,
    z: basis.z * length
  };
}

function createMarkerGroup(markerId) {
  const group = document.createElement('a-entity');

  const axisX = document.createElement('a-entity');
  const axisY = document.createElement('a-entity');
  const axisZ = document.createElement('a-entity');
  const normal = document.createElement('a-entity');
  const label = document.createElement('a-text');

  label.setAttribute('value', markerId);
  label.setAttribute('scale', '0.5 0.5 0.5');
  label.setAttribute('position', '0 0.08 0');
  label.setAttribute('color', '#ffffff');

  group.append(axisX, axisY, axisZ, normal, label);

  return {
    group,
    axisX,
    axisY,
    axisZ,
    normal,
    label
  };
}

export function createMarkerGizmosUpdater(target, markerIds) {
  const root = document.createElement('a-entity');
  const groups = Object.fromEntries(
    markerIds.map((markerId) => {
      const group = createMarkerGroup(markerId);
      root.appendChild(group.group);
      return [markerId, group];
    })
  );
  target.appendChild(root);

  return {
    update(markers) {
      markerIds.forEach((markerId) => {
        const marker = markers[markerId];
        const group = groups[markerId];
        const isVisible = !!marker?.visible && !!marker?.position;
        group.group.object3D.visible = isVisible;
        if (!isVisible) {
          return;
        }

        group.group.setAttribute('position', `${marker.position.x} ${marker.position.y} ${marker.position.z}`);
        setLine(group.axisX, offsetFromAxis(marker.axes?.right, 0.15), '#ff5555');
        setLine(group.axisY, offsetFromAxis(marker.axes?.up, 0.15), '#55ff55');
        setLine(group.axisZ, offsetFromAxis(marker.axes?.forward, 0.15), '#5599ff');
        setLine(group.normal, offsetFromAxis(marker.axes?.up, 0.24), '#d4ff3f');
      });
    },
    root
  };
}

export function createMarkerGizmos(scene, markers) {
  const updater = createMarkerGizmosUpdater(scene, Object.keys(markers));
  updater.update(markers);
  return updater.root;
}
