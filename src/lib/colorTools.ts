import { colord, extend } from 'colord';
import labPlugin from 'colord/plugins/lab';

extend([labPlugin]);

export function labLighter(hexColor: string, delta: number): string {
  const labColor = colord(hexColor).toLab();
  labColor.l = Math.min(100, labColor.l * delta);
  return colord(labColor).toHex();
}
