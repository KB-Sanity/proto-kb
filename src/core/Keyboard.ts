import type { ProtoKBApplication } from './ProtoKBApplication';
import type { KeyCapSize, Point2D } from '../interfaces';
import { Container } from 'pixi.js';
import { KeyCap, type KeyCapAPI, type KeyCapLegends } from './KeyCap';

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

export interface AddKeyCapParams {
  position?: Point2D;
  size?: KeyCapSize;
  pivot?: Point2D;
  angle?: number;
  legends?: KeyCapLegends;
  color?: string;
}

export interface KeyboardAPI {
  addKeyCap(params?: AddKeyCapParams): KeyCapAPI;
  moveBy(position?: Point2D): void;
  getKeyCap(keyCapId: string): KeyCapAPI | void;
  setMetadata(metadata: KeyboardMetadata): void;
  getSelectedKeyCap(): KeyCapAPI | void;
  getAllKeyCaps(): KeyCapAPI[];
}

export class Keyboard {
  public container = new Container();
  private _metadata: KeyboardMetadata = {};
  private _keyCaps: KeyCap[] = [];

  private _api: KeyboardAPI;
  public get api(): KeyboardAPI {
    return this._api;
  }

  constructor(private _app: ProtoKBApplication) {
    this.container.sortableChildren = true;

    const self = this;
    this._api = {
      get addKeyCap() {
        return self._addKeyCap;
      },
      get moveBy() {
        return self._moveBy;
      },
      get getKeyCap() {
        return self._getKeyCap;
      },
      get setMetadata() {
        return self._setMetadata;
      },
      get getSelectedKeyCap() {
        return self._getSelectedKeyCap;
      },
      get getAllKeyCaps() {
        return self._getAllKeyCaps;
      },
    };
  }

  private _setMetadata = (metadata: KeyboardMetadata): void => {
    this._metadata = { ...this._metadata, ...metadata };
  };

  private _getKeyCap = (keyCapId: string): KeyCapAPI | void => {
    return this._keyCaps.find((item) => item.id === keyCapId)?.api;
  };

  private _getAllKeyCaps = (): KeyCapAPI[] => {
    return this._keyCaps.map((item) => item.api);
  };

  private _getSelectedKeyCap = (): KeyCapAPI | void => {
    return this._getKeyCap(this._app.store.layout.get().selectedKey);
  };

  private _moveBy = (delta: Point2D): void => {
    this.container.x += delta.x;
    this.container.y += delta.y;
  };

  private _addKeyCap = (params: AddKeyCapParams = {}): KeyCapAPI => {
    let newPosition: Point2D = params.position || { x: 0, y: 0 };
    if (this._keyCaps.length && !params.position) {
      const lastKeycap = this._keyCaps[this._keyCaps.length - 1].api;
      const newX = lastKeycap.position.x >= 15 ? 0 : lastKeycap.position.x + lastKeycap.size.width;
      const newY = lastKeycap.position.x >= 15 ? lastKeycap.position.y + lastKeycap.size.height : lastKeycap.position.y;
      newPosition = { x: newX, y: newY };
    }

    const keyCap = new KeyCap({
      app: this._app,
      position: newPosition,
      size: params.size || { width: 1, height: 1 },
      pivot: params.pivot,
      angle: params.angle,
      legends: params.legends,
      color: params.color,
    });
    this._keyCaps.push(keyCap.appendTo(this.container));
    return keyCap.api;
  };
}
