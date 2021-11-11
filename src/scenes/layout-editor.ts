import { Rectangle, InteractionEvent, Point } from 'pixi.js';
import { Keyboard } from '../entities/keyboard';
import { AppSettings, Point2D, ProtoKBApplication } from '../interfaces';
import { KLERows } from '../lib/kle';
import { layoutActions } from '../store';

export class LayoutEditor {
  private _layoutOffset: Point2D = { x: 1, y: 1 };
  private _kleFileInput: HTMLInputElement;
  private _fileReader = new FileReader();
  private _keyboard: Keyboard;

  private _dragging = false;
  private _draggingData?: Point;

  constructor(private _app: ProtoKBApplication, private _appSettings: AppSettings) {
    const unitSize = this._appSettings.unitSize;
    this._keyboard = new Keyboard(this._app, this._appSettings);
    this._keyboard.container.position.set(this._layoutOffset.x * unitSize, this._layoutOffset.y * unitSize);

    this._app.stage.addChild(this._keyboard.container);
    this._app.stage.interactive = true;
    this._app.stage.hitArea = new Rectangle(0, 0, _app.view.width, _app.view.height);

    this._kleFileInput = document.getElementById('layout-editor__load-kle-input') as HTMLInputElement;

    this._handleAddButtonClick = this._handleAddButtonClick.bind(this);
    this._handleContainerClick = this._handleContainerClick.bind(this);
    this._handleLoadKLEClick = this._handleLoadKLEClick.bind(this);
    this._handleKLEFileChange = this._handleKLEFileChange.bind(this);
    this._parseKLEFile = this._parseKLEFile.bind(this);
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
    this._handleDragMove = this._handleDragMove.bind(this);

    this._initSubscriptions();
  }

  private _initSubscriptions(): void {
    document.getElementById('layout-editor__add-key')?.addEventListener('click', this._handleAddButtonClick);
    document.getElementById('layout-editor__load-kle')?.addEventListener('click', this._handleLoadKLEClick);
    this._kleFileInput.addEventListener('change', this._handleKLEFileChange);

    this._app.stage.on('pointerdown', this._handleContainerClick);

    // drag container
    this._app.stage
      .on('pointerdown', this._handleDragStart)
      .on('pointerup', this._handleDragEnd)
      .on('pointerupoutside', this._handleDragEnd)
      .on('pointermove', this._handleDragMove);
  }

  private _handleAddButtonClick(): void {
    this._keyboard.addKeyCap();
  }

  private _handleContainerClick(): void {
    if (this._app.state?.layout.value?.selectedKey) {
      layoutActions.selectKey(null);
    }
  }

  private _handleLoadKLEClick(): void {
    this._kleFileInput.click();
  }

  private _handleKLEFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (file) {
      this._fileReader.onload = this._parseKLEFile;
      this._fileReader.readAsText(file);
    }
  }

  private _parseKLEFile(event: ProgressEvent): void {
    const reader = event.target as FileReader;
    if (reader.result) {
      const rows: KLERows = JSON.parse(reader.result as string);
      this._keyboard.importKLEData(rows);
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

      this._keyboard.moveBy({ x: deltaX, y: deltaY });

      this._draggingData = cursorPosition;
    }
  }
}
