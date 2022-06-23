import type { ProtoKBApplication } from '../entities/ProtoKBApplication';
import { Rectangle, InteractionEvent, Point } from 'pixi.js';
import { layoutActions } from '../store';
import type { Point2D } from '../interfaces';
import { Keyboard } from '../entities/Keyboard';
import type { KLERows } from '../lib/kle';
import { LayoutEditorAPI } from './LayoutEditorAPI';

export class LayoutEditor {
  private _layoutOffset: Point2D = { x: 1, y: 1 };
  private _kleFileInput: HTMLInputElement;
  private _fileReader = new FileReader();
  private _keyboard: Keyboard;
  public get keyboard() {
    return this._keyboard;
  }

  private _dragging = false;
  private _draggingData?: Point;

  constructor(private _app: ProtoKBApplication) {
    const unitSize = this._app.settings.unitSize;
    this._keyboard = new Keyboard(this._app);
    this._keyboard.container.position.set(this._layoutOffset.x * unitSize, this._layoutOffset.y * unitSize);

    this._app.stage.addChild(this._keyboard.container);
    this._app.stage.interactive = true;
    this._app.stage.hitArea = new Rectangle(0, 0, _app.view.width, _app.view.height);

    this._kleFileInput = document.getElementById('layout-editor__load-kle-input') as HTMLInputElement;

    this._handleContainerClick = this._handleContainerClick.bind(this);
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
    this._handleDragMove = this._handleDragMove.bind(this);

    this._initSubscriptions();
    this._app.api.layoutEditor = new LayoutEditorAPI(this);
  }

  private _initSubscriptions(): void {
    this._app.stage.on('pointerdown', this._handleContainerClick);

    // drag container
    this._app.stage
      .on('pointerdown', this._handleDragStart)
      .on('pointerup', this._handleDragEnd)
      .on('pointerupoutside', this._handleDragEnd)
      .on('pointermove', this._handleDragMove);
  }

  private _handleContainerClick(): void {
    if (this._app.store.layout.get().selectedKey) {
      layoutActions.selectKey(null);
    }
  }

  private _handleDragStart(event: InteractionEvent): void {
    this._draggingData = event.data.getLocalPosition(this._app.stage);
    this._dragging = true;
  }

  private _handleDragEnd(): void {
    this._dragging = false;
    this._draggingData = undefined;
    this._app.stage.cursor = 'default';
  }

  private _handleDragMove(event: InteractionEvent): void {
    if (this._dragging && this._draggingData) {
      this._app.stage.cursor = 'grabbing';
      const cursorPosition = event.data.getLocalPosition(this._app.stage);

      const deltaX = cursorPosition.x - this._draggingData.x;
      const deltaY = cursorPosition.y - this._draggingData.y;

      this._keyboard.api.moveBy({ x: deltaX, y: deltaY });

      this._draggingData = cursorPosition;
    }
  }
}
