import { Container } from 'pixi.js';
import { ProtoKBApplication, AppSettings, Point2D } from '../interfaces';
import { KLERows, parseData } from '../lib/kle';
import { KeyCap } from './keycap';

export interface KeyboardMetadata {
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

export class Keyboard {
  public container = new Container();
  private _metadata: KeyboardMetadata = {};
  private _keyCaps: KeyCap[] = [];

  constructor(private _app: ProtoKBApplication, private _appSettings: AppSettings) {
    this.container.sortableChildren = true;
    console.log(this);
  }

  public importKLEData(rows: KLERows): void {
    let keyCap: KeyCap;
    for (const key of parseData(rows)) {
      if ('position' in key) {
        keyCap = new KeyCap({
          app: this._app,
          appSettings: this._appSettings,
          position: key.position,
          size: key.size,
          pivot: key.pivot,
          angle: key.angle,
          legends: key.legends,
          color: key.color,
        });

        this._keyCaps.push(keyCap.appendTo(this.container));
      } else {
        this._metadata = key;
      }
    }
  }

  public moveBy(delta: Point2D): void {
    this.container.x += delta.x;
    this.container.y += delta.y;
  }

  public addKeyCap(): void {
    let newPosition: Point2D = { x: 0, y: 0 };
    if (this._keyCaps.length) {
      const lastKeycap = this._keyCaps[this._keyCaps.length - 1];
      const newX = lastKeycap.position.x >= 15 ? 0 : lastKeycap.position.x + lastKeycap.size.width;
      const newY = lastKeycap.position.x >= 15 ? lastKeycap.position.y + lastKeycap.size.height : lastKeycap.position.y;
      newPosition = { x: newX, y: newY };
    }

    this._keyCaps.push(
      new KeyCap({
        app: this._app,
        appSettings: this._appSettings,
        position: newPosition,
        size: { width: 1, height: 1 },
      }).appendTo(this.container),
    );
  }
}
