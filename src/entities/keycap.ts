import { nanoid } from 'nanoid';
import { Container, Graphics, Text } from 'pixi.js';
import { AppSettings, KeyCapSize, Point2D, ProtoKBApplication } from '../interfaces';
import { layoutActions } from '../store';
import { lighten, toHex } from 'color2k';

export interface KeyCapLegends {
  topLeft?: string;
  top?: string;
  topRight?: string;
  left?: string;
  center?: string;
  right?: string;
  bottomLeft?: string;
  bottom?: string;
  bottomRight?: string;
  frontLeft?: string;
  front?: string;
  frontRight?: string;
}

export interface KeyCapOptions {
  app: ProtoKBApplication;
  appSettings: AppSettings;
  position: Point2D;
  secondaryPosition?: Point2D;
  size: KeyCapSize;
  secondarySize?: KeyCapSize;
  pivot?: Point2D;
  angle?: number;
  legends?: KeyCapLegends;
  color?: number;
}

export class KeyCap {
  public id = nanoid();
  private _graphics = new Graphics();
  private _pivotGraphics = new Graphics();
  private _subscriptions: ((() => void) | undefined)[] = [];

  private _app: ProtoKBApplication;
  private _appSettings: AppSettings;
  private _position: Point2D;
  private _secondaryPosition?: Point2D;
  private _size: KeyCapSize;
  private _secondarySize?: KeyCapSize;
  private _pivot?: Point2D;
  private _angle: number;
  private _legends: KeyCapLegends;
  private _keycapColor: number;

  public get position(): Point2D {
    return { ...this._position };
  }

  public get x(): number {
    return this._position.x;
  }

  public get y(): number {
    return this._position.y;
  }

  public get size(): KeyCapSize {
    return { ...this._size };
  }

  public get width(): number {
    return this._size.width;
  }

  public get height(): number {
    return this._size.height;
  }

  public get unitSize(): number {
    return this._appSettings.unitSize;
  }

  public get surfaceWidth(): number {
    const width = this._size.width * this.unitSize - 1; // 1 - is border width
    return width - this.unitSize * 0.2;
  }

  public get surfaceHeight(): number {
    const height = this._size.height * this.unitSize - 1; // 1 - is border width
    return height - this.unitSize * 0.2;
  }

  public get surfaceX(): number {
    return this.unitSize * 0.1;
  }

  public get surfaceY(): number {
    return this.unitSize * 0.05;
  }

  constructor(options: KeyCapOptions) {
    this._app = options.app;
    this._appSettings = options.appSettings;
    this._position = options.position;
    this._size = options.size;
    this._secondaryPosition = options.secondaryPosition;
    this._secondarySize = options.secondarySize;
    this._pivot = options.pivot;
    this._angle = options.angle;
    this._legends = options.legends;
    this._keycapColor = options.color || 0xCCCCCC;

    this._graphics.interactive = true;
    this._graphics.cursor = 'pointer';

    this._graphics.on('pointerdown', this._onClick.bind(this));

    this._initSubscriptions();
    this._draw();
  }

  public moveBy(delta: Point2D): void {
    this._graphics.x += delta.x;
    this._graphics.y += delta.y;
  }

  private _initSubscriptions(): void {
    this._subscriptions.push(this._app.state?.layout.listen(() => this._draw()));
  }

  private _onClick(event: PointerEvent): void {
    layoutActions.selectKey(this.id);
    event.stopPropagation();
  }

  private _draw(): void {
    const unitSize = this._appSettings.unitSize;
    const cornerRadius = this._appSettings.keyCapCornerRadius;
    const isSelected = this._app.state?.layout.value?.selectedKey === this.id;
    const surfaceColor = parseInt(toHex(lighten('#' + this._keycapColor.toString(16), 0.17)).replace('#', ''), 16);

    this._graphics.pivot.set(
      (this._pivot.x - this._position.x) * unitSize,
      (this._pivot.y - this._position.y) * unitSize
    );

    this._graphics.position.x = this._position.x * unitSize + this._graphics.pivot.x;
    this._graphics.position.y = this._position.y * unitSize + this._graphics.pivot.y;
    const width = this._size.width * unitSize - 1; // 1 - is border width
    const height = this._size.height * unitSize - 1; // 1 - is border width

    this._pivotGraphics.clear();
    this._graphics.clear();
    this._graphics.removeChildren();

    this._pivotGraphics.zIndex = this._graphics.zIndex = isSelected ? 100 : 1;

    this._pivotGraphics.beginFill(0xff0000);
    this._pivotGraphics.position.set(this._pivot.x * unitSize, this._pivot.y * unitSize);
    this._pivotGraphics.drawCircle(0, 0, 5)
    this._pivotGraphics.endFill()
    this._pivotGraphics.visible = isSelected;

    this._graphics.angle = this._angle;

    this._graphics.lineStyle({ width: 1, color: isSelected ? 0xe54803 : 0x000000 });
    this._graphics.beginFill(this._keycapColor);
    this._graphics.drawRoundedRect(0, 0, width, height, cornerRadius * unitSize);
    this._graphics.endFill();

    this._graphics.lineStyle({ width: 1, color: 0xb7b7b7 });
    this._graphics.beginFill(surfaceColor);
    this._graphics.drawRoundedRect(
      this.surfaceX,
      this.surfaceY,
      this.surfaceWidth,
      this.surfaceHeight,
      cornerRadius * unitSize * 0.8,
    );
    this._graphics.endFill();

    this._drawLegends();
  }

  // TODO: refactor
  private _drawLegends(): void {
    const padding = this.unitSize * 0.05;
    const height = this._size.height * this.unitSize - 1; // 1 - is border width
    const legendsSurfaceWidth = this.surfaceWidth - padding * 2;
    const legendsSurfaceHeight = this.surfaceHeight - padding * 2;
    const legendsSurfaceX = this.surfaceX + padding;
    const legendsSurfaceY = this.surfaceY + padding;

    for (let [key, value] of Object.entries(this._legends)) {
      if (value?.length) {
        const text = new Text(value, { fontSize: legendsSurfaceHeight / 3 });
        let legendPosition: Point2D;
        let legendPivot: Point2D;
        switch (key) {
          case 'topLeft':
            legendPosition = { x: legendsSurfaceX, y: legendsSurfaceY };
            legendPivot = { x: 0, y: 0 };
            break;
          case 'top':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth / 2, y: legendsSurfaceY };
            legendPivot = { x: text.width / 2, y: 0 };
            break;
          case 'topRight':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth, y: legendsSurfaceY };
            legendPivot = { x: text.width, y: 0 };
            break;
          case 'left':
            legendPosition = { x: legendsSurfaceX, y: legendsSurfaceY + legendsSurfaceHeight / 2 };
            legendPivot = { x: 0, y: text.height / 2 };
            break;
          case 'center':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth / 2, y: legendsSurfaceY + legendsSurfaceHeight / 2 };
            legendPivot = { x: text.width / 2, y: text.height / 2 };
            break;
          case 'right':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth, y: legendsSurfaceY + legendsSurfaceHeight / 2 };
            legendPivot = { x: text.width, y: text.height / 2 };
            break;
          case 'bottomLeft':
            legendPosition = { x: legendsSurfaceX, y: legendsSurfaceY + legendsSurfaceHeight };
            legendPivot = { x: 0, y: text.height };
            break;
          case 'bottom':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth / 2, y: legendsSurfaceY + legendsSurfaceHeight };
            legendPivot = { x: text.width / 2, y: text.height };
            break;
          case 'bottomRight':
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth, y: legendsSurfaceY + legendsSurfaceHeight };
            legendPivot = { x: text.width, y: text.height };
            break;
          case 'frontLeft':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = { x: legendsSurfaceX, y: height + padding / 2 - 1 };
            legendPivot = { x: 0, y: text.height };
            break;
          case 'front':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth / 2, y: height + padding / 2 - 1 };
            legendPivot = { x: text.width / 2, y: text.height };
            break;
          case 'frontRight':
            text.style.fontSize = height - this.surfaceHeight - this.surfaceY;
            legendPosition = { x: legendsSurfaceX + legendsSurfaceWidth, y: height + padding / 2 - 1 };
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
    container.addChild(this._pivotGraphics);
    return this;
  }
}
