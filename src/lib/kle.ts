export type KLERows = (KLEMetadata | KLERow)[];

export type KLERow = (KLEKey | string)[];

export interface KLEMetadata {
  author?: string;
  backcolor?: string;
  background?: { name: string; style: string } | null;
  name?: string;
  notes?: string;
  radii?: string;
  switchBrand?: string;
  switchMount?: string;
  switchType?: string;
}

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

  rx?: number; // x position of center of rotation for the key
  ry?: number; // y position of center of rotation for the key
  r?: number; // specifies the angle the key is rotated (about the center of rotation)

  n?: boolean; // homing bar
  a?: number; // legends align

  c?: string; // keycap background color
  t?: string; // legend text colors separated by \n
}

export interface ParsedKLELegend {
  text: string;
  color?: string;
  size?: number;
}

export interface ParsedKLELegends {
  topLeft?: ParsedKLELegend;
  top?: ParsedKLELegend;
  topRight?: ParsedKLELegend;
  left?: ParsedKLELegend;
  center?: ParsedKLELegend;
  right?: ParsedKLELegend;
  bottomLeft?: ParsedKLELegend;
  bottom?: ParsedKLELegend;
  bottomRight?: ParsedKLELegend;
  frontLeft?: ParsedKLELegend;
  front?: ParsedKLELegend;
  frontRight?: ParsedKLELegend;
}

export interface ParsedKLEKey {
  position: { x: number; y: number };
  size: { width: number; height: number };
  pivot: { x: number; y: number };
  angle: number;
  legends: ParsedKLELegends;
  color: string;
}

const KLEAlignMappings = [
  [
    'topLeft',
    'bottomLeft',
    'topRight',
    'bottomRight',
    'frontLeft',
    'frontRight',
    'left',
    'right',
    'top',
    'center',
    'bottom',
    'front',
  ], // 0 = no centering
  ['top', 'bottom', null, null, 'frontLeft', 'frontRight', 'center', null, null, null, null, 'front'], // 1 = center x
  ['left', null, 'right', null, 'frontLeft', 'frontRight', null, null, 'center', null, null, 'front'], // 2 = center y
  ['center', null, null, null, 'frontLeft', 'frontRight', null, null, null, null, null, 'front'], // 3 = center x & y
  ['topLeft', 'bottomLeft', 'topRight', 'bottomRight', 'front', null, 'left', 'right', 'top', 'center', 'bottom', null], // 4 = center front (default)
  ['top', 'bottom', null, null, 'front', null, 'center', null, null, null, null, null], // 5 = center front & x
  ['left', null, 'right', null, 'front', null, null, null, 'center', null, null, null], // 6 = center front & y
  ['center', null, null, null, 'front', null, null, null, null, null, null, null], // 7 = center front & x & y
];

export function* parseData(rows: KLERows): Generator<ParsedKLEKey | KLEMetadata, any, ParsedKLEKey | KLEMetadata> {
  const keyState: KLEKey = { x: 0, y: 0, rx: 0, ry: 0, h: 1, w: 1, a: 4, c: '#cccccc', t: '#000000' };
  const cluster = { x: 0, y: 0 };
  for (const row of rows) {
    if (!Array.isArray(row)) {
      yield { ...row };
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

        if ('a' in key) keyState.a = key.a;
        if ('c' in key) keyState.c = key.c;
        if ('t' in key) keyState.t = key.t;
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
        const legends: Record<string, ParsedKLELegend> = {};
        if (key.length) {
          const flatLegends = key.split('\n');
          const flatLegendsColors = keyState.t.split('\n');
          const alignMap = KLEAlignMappings[keyState.a];
          for (let i = 0; i < flatLegends.length; i++) {
            const legend = flatLegends[i];
            const legendPlacement = alignMap[i];
            if (legend.length && legendPlacement) {
              legends[legendPlacement] = {
                text: legend,
                color: flatLegendsColors[i] || '#000000',
              };
            }
          }
        }

        yield { position, size, pivot, angle, legends, color: keyState.c };

        keyState.x += size.width;
        keyState.w = keyState.h = 1;
        keyState.x2 = keyState.y2 = keyState.w2 = keyState.h2 = 0;
      }
    }
    ++keyState.y;
    keyState.x = keyState.rx;
  }
}
