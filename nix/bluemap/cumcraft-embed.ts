type Position = { x: number; y?: number; z: number };
type Player = { foreign?: boolean; position?: Position };
type Marker = { type: string; position?: Position };
type TileGrid = { tileSize: { x: number; z: number }; translate: { x: number; z: number } };
type MapView = {
  data: { liveDataRoot: string; mapDataRoot: string; startPos: Position; hires: TileGrid };
  hiresTileManager?: { tileLoader?: { tilePath: string; clientDecompression?: boolean } };
};
type BlueMap = {
  loadPlayerData(map: MapView): Promise<{ players?: (Player | null)[] }>;
  setPerspectiveView(view: number): void;
  updatePageAddress(): void;
  events: EventTarget;
  mapViewer: {
    map: MapView;
    data: { mapState: string };
    updateLoadedMapArea(): void;
    controlsManager: {
      position: { set(x: number, y: number, z: number): void };
      distance: number;
      rotation: number;
      angle: number;
      tilt: number;
      ortho: number;
    };
  };
};

declare const window: Window & { bluemap: BlueMap };
export {};

if (window.parent !== window) {
  const app = window.bluemap;
  const style = document.createElement('style');
  style.textContent = '#app { display: none !important; }';
  document.head.appendChild(style);

  window.addEventListener('message', (event: MessageEvent<{ type?: string; interactive?: unknown } | null>) => {
    if (event.source !== window.parent || event.data?.type !== 'cumcraft:map-mode' || typeof event.data.interactive !== 'boolean') return;
    style.disabled = event.data.interactive;
  });

  function validPosition(position?: Position): position is Position {
    return !!position && Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z);
  }

  function randomPosition(positions: Position[]): Position | undefined {
    return positions[Math.floor(Math.random() * positions.length)];
  }

  function shuffled<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function splitTileCoord(value: number): string {
    return (value < 0 ? '-' : '') + Math.abs(value).toString().split('').join('/');
  }

  function hiresTileUrl(map: MapView, position: Position): string {
    const { tileSize, translate } = map.data.hires;
    const tileX = Math.floor((position.x - translate.x) / tileSize.x);
    const tileZ = Math.floor((position.z - translate.z) / tileSize.z);
    const loader = map.hiresTileManager?.tileLoader;
    const base = loader?.tilePath ?? `${map.data.mapDataRoot}/tiles/0/`;
    const ext = loader?.clientDecompression ? '.prbm.gz' : '.prbm';
    return `${base}x${splitTileCoord(tileX)}/z${splitTileCoord(tileZ)}${ext}`;
  }

  async function isRendered(map: MapView, position: Position): Promise<boolean> {
    try {
      const response = await fetch(hiresTileUrl(map, position));
      void response.body?.cancel();
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async function pickRenderedPlayer(map: MapView): Promise<Position | undefined> {
    const data = await app.loadPlayerData(map);
    const players = shuffled(
      (Array.isArray(data.players) ? data.players : [])
        .filter((player): player is Player & { position: Position } => !!player && !player.foreign && validPosition(player.position))
        .map((player) => player.position),
    );

    for (const candidate of players) {
      if (await isRendered(map, candidate)) return candidate;
    }
    return undefined;
  }

  async function focus() {
    const map = app.mapViewer.map;
    let position: Position | undefined;

    try {
      position = await pickRenderedPlayer(map);
    } catch {
      // Continue with landmarks if player data is unavailable.
    }

    if (!position) {
      try {
        const response = await fetch(`${map.data.liveDataRoot}/live/markers.json`);
        if (!response.ok) throw new Error('Failed to load markers');
        const data: { landmarks?: { markers?: Record<string, Marker | null> } } = await response.json();
        position = randomPosition(Object.values(data.landmarks?.markers ?? {})
          .filter((marker): marker is Marker & { position: Position } => !!marker && (marker.type === 'poi' || marker.type === 'html') && validPosition(marker.position))
          .map((marker) => marker.position));
      } catch {
        // Fall back to the map's start position.
      }
    }

    position ||= map.data.startPos;
    app.setPerspectiveView(0);
    const controls = app.mapViewer.controlsManager;
    controls.position.set(position.x, position.y ?? 0, position.z);
    controls.distance = 150;
    controls.rotation = 0;
    controls.angle = 0.7;
    controls.tilt = 0;
    controls.ortho = 0;
    app.updatePageAddress();
    app.mapViewer.updateLoadedMapArea();
  }

  async function ready() {
    try {
      await focus();
    } catch (error) {
      console.error('Failed to focus embedded map:', error);
    }
    window.parent.postMessage({ type: 'cumcraft:map-ready' }, '*');
  }
  if (app.mapViewer.data.mapState === 'loaded') {
    ready();
  } else {
    app.events.addEventListener('bluemapMapChanged', ready, { once: true });
  }
}
