import { nanoid } from 'nanoid';
import { Container, Graphics, Text, utils } from 'pixi.js';
import type { KeyCapSize, Point2D } from '../interfaces';
import { labLighter } from '../lib/colorTools';
import { layoutActions } from '../store';
import type { LayoutStore } from '../store/layout';
import type { ProtoKBApplication } from './ProtoKBApplication';

export interface KeyCapLegend {
  text: string;
  color?: string;
  size?: number;
}

export interface KeyCapLegends {
  topLeft?: KeyCapLegend;
  top?: KeyCapLegend;
  topRight?: KeyCapLegend;
  left?: KeyCapLegend;
  center?: KeyCapLegend;
  right?: KeyCapLegend;
  bottomLeft?: KeyCapLegend;
  bottom?: KeyCapLegend;
  bottomRight?: KeyCapLegend;
  frontLeft?: KeyCapLegend;
  front?: KeyCapLegend;
  frontRight?: KeyCapLegend;
}

export interface KeyCapOptions {
  app: ProtoKBApplication;
  position: Point2D;
  size: KeyCapSize;
  secondaryPosition?: Point2D;
  secondarySize?: KeyCapSize;
  pivot?: Point2D;
  angle?: number;
  legends?: KeyCapLegends;
  color?: string;
}

export interface KeyCapAPI {
  // PROPERTIES
  position: Point2D;
  x: number;
  y: number;
  size: KeyCapSize;
  width: number;
  height: number;
  pivot: Point2D;
  angle: number;
  color: string;
  id: string;

  // METHODS
  moveTo(position: Point2D): void;
  setSize(size: KeyCapSize): void;
  setPivot(pivot: Point2D): void;
  setAngle(angle: number): void;
  setColor(color: string): void;
  toJSON(): KeyCapData;
  fromJSON(json: KeyCapData): void;
}

export interface KeyCapData {
  position: Point2D;
  size: KeyCapSize;
  pivot: Point2D;
  angle: number;
  legends: KeyCapLegends;
  color: string;
}

const defaultOptions: Partial<KeyCapOptions> = {
  pivot: { x: 0, y: 0 },
  size: { width: 1, height: 1 },
  legends: {},
  color: '#cccccc',
  angle: 0,
};

export class KeyCap {
  public id = nanoid();
  private _graphics = new Graphics();
  private _subscriptions: ((() => void) | undefined)[] = [];

  private _app: ProtoKBApplication;
  private _position: Point2D;
  private _secondaryPosition?: Point2D;
  private _size: KeyCapSize;
  private _secondarySize?: KeyCapSize;
  private _pivot?: Point2D;
  private _angle: number;
  private _legends: KeyCapLegends;
  private _keycapColor: string;

  private _api: KeyCapAPI;
  public get api(): KeyCapAPI {
    return this._api;
  }

  private get _unitSize(): number {
    return this._app.settings.unitSize;
  }

  public get surfaceWidth(): number {
    const width = this._size.width * this._unitSize - 1; // 1 - is border width
    return width - this._unitSize * 0.2;
  }

  public get surfaceHeight(): number {
    const height = this._size.height * this._unitSize - 1; // 1 - is border width
    return height - this._unitSize * 0.2;
  }

  public get surfaceX(): number {
    return this._unitSize * 0.1;
  }

  public get surfaceY(): number {
    return this._unitSize * 0.05;
  }

  constructor(opt: KeyCapOptions) {
    for (const key in opt) {
      if (opt[key] === undefined) {
        delete opt[key];
      }
    }

    const options = { ...defaultOptions, ...opt };
    this._app = options.app;
    this._position = options.position;
    this._size = options.size;
    this._secondaryPosition = options.secondaryPosition;
    this._secondarySize = options.secondarySize;
    this._pivot = options.pivot;
    this._angle = options.angle;
    this._legends = options.legends;
    this._keycapColor = options.color;

    this._graphics.interactive = true;
    this._graphics.cursor = 'pointer';

    this._graphics.on('pointerdown', this._onClick.bind(this));

    this._initSubscriptions();
    this._draw();

    const self = this;
    this._api = {
      // PROPERTIES
      get position() {
        return { ...self._position };
      },
      get x() {
        return self._position.x;
      },
      get y() {
        return self._position.y;
      },
      get size() {
        return { ...self._size };
      },
      get width() {
        return self._size.width;
      },
      get height() {
        return self._size.height;
      },
      get pivot() {
        return { ...self._pivot };
      },
      get angle() {
        return self._angle;
      },
      get color() {
        return self._keycapColor;
      },
      get id() {
        return self.id;
      },

      // METHODS
      get moveTo() {
        return self._moveTo;
      },
      get setSize() {
        return self._setSize;
      },
      get setPivot() {
        return self._setPivot;
      },
      get setAngle() {
        return self._setAngle;
      },
      get setColor() {
        return self._setColor;
      },
      get toJSON() {
        return self._toJSON;
      },
      get fromJSON() {
        return self._fromJSON;
      },
    };
  }

  private _setColor = (color: string): void => {
    this._keycapColor = color;
    this._draw();
  };

  private _setAngle = (angle: number): void => {
    this._angle = angle;
    this._draw();
  };

  private _moveTo = (position: Point2D): void => {
    this._position = { ...position };
    this._draw();
  };

  private _setSize = (size: KeyCapSize): void => {
    this._size = { ...size };
    this._draw();
  };

  private _setPivot = (pivot: Point2D): void => {
    this._pivot = { ...pivot };
    this._draw();
  };

  private _toJSON = (): KeyCapData => {
    return {
      position: { ...this._position },
      size: { ...this._size },
      pivot: { ...this._pivot },
      angle: this._angle,
      color: this._keycapColor,
      legends: JSON.parse(JSON.stringify(this._legends)), // TODO normal deep clone
    };
  };

  private _fromJSON = (json: KeyCapData) => {
    this._position = { ...json.position };
    this._size = { ...json.size };
    this._pivot = { ...json.pivot };
    this._angle = json.angle;
    this._keycapColor = json.color;
    this._legends = JSON.parse(JSON.stringify(this._legends)); // TODO normal deep clone
  };

  private _initSubscriptions(): void {
    this._subscriptions.push(this._app.store.layout.listen((state) => this._draw(state)));
  }

  private _onClick(event: PointerEvent): void {
    layoutActions.selectKey(this.id);
    event.stopPropagation();
  }

  private _draw(layoutState: LayoutStore = this._app.store.layout.get()): void {
    const unitSize = this._app.settings.unitSize;
    const cornerRadius = this._app.settings.keyCapCornerRadius;
    const isSelected = layoutState.selectedKey === this.id;
    const surfaceColor = labLighter(this._keycapColor, 1.2);
    const surfaceBorderColor = labLighter(this._keycapColor, 0.9);

    this._graphics.pivot.set(
      (this._pivot.x - this._position.x) * unitSize,
      (this._pivot.y - this._position.y) * unitSize
    );

    this._graphics.position.x = this._position.x * unitSize + this._graphics.pivot.x;
    this._graphics.position.y = this._position.y * unitSize + this._graphics.pivot.y;
    const width = this._size.width * unitSize - 1; // 1 - is border width
    const height = this._size.height * unitSize - 1; // 1 - is border width

    this._graphics.clear();
    this._graphics.removeChildren();
    this._graphics.angle = this._angle;

    // Outline
    this._graphics
      .lineStyle({ width: 1, color: isSelected ? 0xe54803 : 0x000000 })
      .beginFill(utils.string2hex(this._keycapColor))
      .drawRoundedRect(0, 0, width, height, cornerRadius * unitSize)
      .endFill();

    // Surface
    this._graphics
      .lineStyle({ width: 1, color: utils.string2hex(surfaceBorderColor) })
      .beginFill(utils.string2hex(surfaceColor))
      .drawRoundedRect(
        this.surfaceX,
        this.surfaceY,
        this.surfaceWidth,
        this.surfaceHeight,
        cornerRadius * unitSize * 0.8
      )
      .endFill();

    this._drawLegends();
    this._drawPivot();
  }

  private _drawPivot(): void {
    if (this._pivot.x !== 0 || this._pivot.y !== 0) {
      const x = this._pivot.x * this._unitSize;
      const y = this._pivot.y * this._unitSize;
      const rad = Math.PI / 180;
      const a = this._angle;
      this._graphics
        .lineStyle({ width: 2, color: 0x000000 })
        // vertical
        .moveTo(x + Math.cos((-90 - a) * rad) * 5, y + Math.sin((-90 - a) * rad) * 5)
        .lineTo(x + Math.cos((90 - a) * rad) * 5, y + Math.sin((90 - a) * rad) * 5)
        // horizontal
        .moveTo(x + Math.cos(-a * rad) * 5, y + Math.sin(-a * rad) * 5)
        .lineTo(x + Math.cos((180 - a) * rad) * 5, y + Math.sin((180 - a) * rad) * 5);
    }
  }

  // TODO: refactor
  private _drawLegends(): void {
    const padding = this._unitSize * 0.05;
    const height = this._size.height * this._unitSize - 1; // 1 - is border width
    const legendsSurfaceWidth = this.surfaceWidth - padding * 2;
    const legendsSurfaceHeight = this.surfaceHeight - padding * 2;
    const legendsSurfaceX = this.surfaceX + padding;
    const legendsSurfaceY = this.surfaceY + padding;

    for (const [key, value] of Object.entries(this._legends) as [string, KeyCapLegend][]) {
      if (value?.text.length) {
        const text = new Text(value.text, {
          fontSize: ((this._unitSize - 1) * 0.8) / 3,
          fill: value.color,
        });
        let legendPosition: Point2D;
        let legendPivot: Point2D;
        switch (key) {
          case 'topLeft':
            legendPosition = { x: legendsSurfaceX, y: legendsSurfaceY };
            legendPivot = { x: 0, y: 0 };
            break;
          case 'top':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth / 2,
              y: legendsSurfaceY,
            };
            legendPivot = { x: text.width / 2, y: 0 };
            break;
          case 'topRight':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth,
              y: legendsSurfaceY,
            };
            legendPivot = { x: text.width, y: 0 };
            break;
          case 'left':
            legendPosition = {
              x: legendsSurfaceX,
              y: legendsSurfaceY + legendsSurfaceHeight / 2,
            };
            legendPivot = { x: 0, y: text.height / 2 };
            break;
          case 'center':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth / 2,
              y: legendsSurfaceY + legendsSurfaceHeight / 2,
            };
            legendPivot = { x: text.width / 2, y: text.height / 2 };
            break;
          case 'right':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth,
              y: legendsSurfaceY + legendsSurfaceHeight / 2,
            };
            legendPivot = { x: text.width, y: text.height / 2 };
            break;
          case 'bottomLeft':
            legendPosition = {
              x: legendsSurfaceX,
              y: legendsSurfaceY + legendsSurfaceHeight,
            };
            legendPivot = { x: 0, y: text.height };
            break;
          case 'bottom':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth / 2,
              y: legendsSurfaceY + legendsSurfaceHeight,
            };
            legendPivot = { x: text.width / 2, y: text.height };
            break;
          case 'bottomRight':
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth,
              y: legendsSurfaceY + legendsSurfaceHeight,
            };
            legendPivot = { x: text.width, y: text.height };
            break;
          case 'frontLeft':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = { x: legendsSurfaceX, y: height + padding / 2 - 1 };
            legendPivot = { x: 0, y: text.height };
            break;
          case 'front':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth / 2,
              y: height + padding / 2 - 1,
            };
            legendPivot = { x: text.width / 2, y: text.height };
            break;
          case 'frontRight':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = {
              x: legendsSurfaceX + legendsSurfaceWidth,
              y: height + padding / 2 - 1,
            };
            legendPivot = { x: text.width, y: text.height };
            break;
        }

        text.position.set(legendPosition.x, legendPosition.y);
        text.pivot.set(legendPivot.x, legendPivot.y);
        this._graphics.addChild(text);
      }
    }
  }

  public destroy(): void {
    this._app.stage.removeChild(this._graphics);
    this._destroySubscriptions();
  }

  private _destroySubscriptions(): void {
    for (const subscription of this._subscriptions) {
      subscription?.();
    }
  }

  public appendTo(container: Container): KeyCap {
    container.addChild(this._graphics);
    return this;
  }
}
