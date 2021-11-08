export type KLERows = KLERow[];

export type KLERow = (KLEKey | string)[]

export interface KLEKey {
    // Primary key rectangle
    x?: number; // absolute x position of the key in keyboard units
    y?: number; // absolute y position of the key in keyboard units
    h?: number; // height of the key, in keyboard units
    w?: number; // width of the key, in keyboard units

    // Secondary key rectangle (used to define oddly-shaped keys)
    x2?: number; // relative to x position of the key in keyboard units
    y2?: number; // relative to y position of the key in keyboard units
    h2?: number; // height of the key, in keyboard units
    w2?: number; // width of the key, in keyboard units

    t?: string; // legend text colors separated by \n

    rx?: number; // x position of center of rotation for the key
    ry?: number; // y position of center of rotation for the key
    r?: number; // specifies the angle the key is rotated (about the center of rotation)

    n?: boolean; // homing bar
    a?: number; // legends align
}

export interface ParsedKLEKey {
    position: { x: number; y: number };
    size: { width: number; height: number };
    pivot: { x: number; y: number };
    angle: number;
}

export function* parseData(rows: KLERows): Generator<ParsedKLEKey, any, ParsedKLEKey> {
    const keyState: KLEKey = { x: 0, y: 0, rx: 0, ry: 0, h: 1, w: 1 };
      const cluster = { x: 0, y: 0 };
      for (const row of rows) {
        if (!Array.isArray(row)) {
          // TODO: Parse metadata
          continue;
        }
        for (const key of row) {
          if (typeof key === 'object') {
            if ('rx' in key) {
              keyState.rx = cluster.x = key.rx;
              keyState.x = cluster.x;
              keyState.y = cluster.y;
            }

            if ('ry' in key) {
              keyState.ry = cluster.y = key.ry;
              keyState.x = cluster.x;
              keyState.y = cluster.y;
            }

            if (key.x) keyState.x += key.x;
            if (key.y) keyState.y += key.y;
            if ('r' in key) keyState.r = key.r;
            if ('w' in key) keyState.w = key.w;
            if ('h' in key) keyState.h = key.h;

            if ('h2' in key && !('h' in key)) keyState.h = key.h2;
            else if ('h2' in key) keyState.h2 = key.h2;

            if ('w2' in key && !('w' in key)) keyState.w = key.w2;
            else if ('w2' in key) keyState.w2 = key.w2;
          } else {
            const position = {
              x: keyState.x,
              y: keyState.y,
            };

            const size = {
              width: keyState.w || keyState.w2 || 1,
              height: keyState.h || keyState.h2 || 1,
            };

            const pivot = {
              x: keyState.rx ?? 0,
              y: keyState.ry ?? 0,
            };

            const angle = keyState.r ?? 0;

            yield { position, size, pivot, angle };
            
            keyState.x += size.width;
            keyState.w = keyState.h = 1;
            keyState.x2 = keyState.y2 = keyState.w2 = keyState.h2 = 0;
          }
        }
        ++keyState.y;
        keyState.x = keyState.rx;
    }
}