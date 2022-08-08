import type { ProtoKBApplication } from '../../core/ProtoKBApplication';
import { Rectangle, InteractionEvent, Point } from 'pixi.js';
import { layoutActions } from '../../store';
import type { Point2D } from '../../interfaces';
import { Keyboard } from '../../core/Keyboard';
import type { Plugin } from '../../core/PluginsLoader';
import type { KeyCapAPI, KeyCapData } from '../../core/KeyCap';
import type { LayoutEditorAPI } from './interfaces';
import type { ProtoPlugin } from 'src/core/ProtoPlugin';

export interface KeyboardData {
  version: string;
  keyCaps: KeyCapData[];
  plugins: PluginsData;
}

interface PluginData {
  id: string;
  url: string;
  data: any;
}

type PluginsData = PluginData[];

export class LayoutEditor {
  private _schemaVersion = '1';
  private _layoutOffset: Point2D = { x: 1, y: 1 };
  private _keyboard: Keyboard;
  public get keyboard() {
    return this._keyboard;
  }

  private _dragging = false;
  private _draggingData?: Point;

  private _api: LayoutEditorAPI;
  public get api(): LayoutEditorAPI {
    return this._api;
  }

  constructor(private _app: ProtoKBApplication) {
    const unitSize = this._app.settings.unitSize;
    this._keyboard = new Keyboard(this._app);
    this._keyboard.container.position.set(this._layoutOffset.x * unitSize, this._layoutOffset.y * unitSize);

    this._app.stage.addChild(this._keyboard.container);
    this._app.stage.interactive = true;
    this._app.stage.hitArea = new Rectangle(0, 0, _app.view.width, _app.view.height);

    this._handleContainerClick = this._handleContainerClick.bind(this);
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
    this._handleDragMove = this._handleDragMove.bind(this);

    this._initSubscriptions();

    const self = this;
    this._api = {
      get getKeyboard() {
        return () => self.keyboard.api;
      },
      get getKeyboardData() {
        return self._getKeyboardData;
      },
      get setKeyboardData() {
        return self._setKeyboardData;
      },
    };

    this._app.api.layoutEditor = this._api;
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

  private _getPluginsData(): PluginsData {
    const pluginsList = this._app.api.pluginsLoader.getExternalPlugins();
    const pluginsData: PluginsData = [];

    let data;
    let info: Omit<Plugin, 'instance'>;
    for (const pluginId of pluginsList) {
      data = this._app.api.pluginsLoader.getPluginData(pluginId);
      info = this._app.api.pluginsLoader.getPluginInfo(pluginId);
      pluginsData.push({
        id: pluginId,
        data,
        url: info.url,
      });
    }

    return pluginsData;
  }

  public _getKeyboardData = (): KeyboardData => {
    const keyboard = this.keyboard.api;
    const keyCaps = keyboard.getAllKeyCaps();

    const keyboardData: KeyboardData = {
      version: this._schemaVersion,
      keyCaps: keyCaps.map((item) => item.toJSON()),
      plugins: this._getPluginsData(),
    };

    return keyboardData;
  };

  public _setKeyboardData = async (data: KeyboardData) => {
    const keyboard = this.keyboard.api;

    let keyCapInstance: KeyCapAPI;
    for (const keyCap of data.keyCaps) {
      keyCapInstance = keyboard.addKeyCap();
      keyCapInstance.fromJSON(keyCap);
    }

    let instance: ProtoPlugin;
    for (const plugin of data.plugins) {
      instance = await this._app.pluginsLoader.loadPlugin(plugin.url);
      if (plugin.data) {
        instance.setData?.(plugin.data);
      }
    }
  };
}
