if (window.parent !== window) {
  const style = document.createElement('style');
  style.textContent = '#app { display: none !important; }';
  document.head.appendChild(style);

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.data?.type !== 'cumcraft:map-mode' || typeof event.data.interactive !== 'boolean') return;
    style.disabled = event.data.interactive;
  });

  const validPosition = (position) => position && ['x', 'y', 'z'].every((axis) => Number.isFinite(position[axis]));
  const randomPosition = (positions) => positions[Math.floor(Math.random() * positions.length)];

  const focus = async () => {
    const app = window.bluemap;
    const map = app.mapViewer.map;
    let position;

    try {
      const data = await app.loadPlayerData(map);
      position = randomPosition((Array.isArray(data.players) ? data.players : [])
        .filter((player) => player && !player.foreign && validPosition(player.position))
        .map((player) => player.position));
    } catch {
      // Continue with landmarks if player data is unavailable.
    }

    if (!position) {
      try {
        const response = await fetch(`${map.data.liveDataRoot}/live/markers.json`);
        if (!response.ok) throw new Error('Failed to load markers');
        const data = await response.json();
        position = randomPosition(Object.values(data.landmarks?.markers ?? {})
          .filter((marker) => marker && (marker.type === 'poi' || marker.type === 'html') && validPosition(marker.position))
          .map((marker) => marker.position));
      } catch {
        // Fall back to the map's start position.
      }
    }

    position ||= map.data.startPos;
    app.setPerspectiveView(0);
    const controls = app.mapViewer.controlsManager;
    controls.position.set(position.x, position.y, position.z);
    controls.distance = 150;
    controls.rotation = 0;
    controls.angle = 0.7;
    controls.tilt = 0;
    controls.ortho = 0;
    app.updatePageAddress();
    app.mapViewer.updateLoadedMapArea();
  };

  const ready = async () => {
    try {
      await focus();
    } catch (error) {
      console.error('Failed to focus embedded map:', error);
    }
    window.parent.postMessage({ type: 'cumcraft:map-ready' }, '*');
  };
  if (window.bluemap.mapViewer.data.mapState === 'loaded') {
    ready();
  } else {
    window.bluemap.events.addEventListener('bluemapMapChanged', ready, { once: true });
  }
}
