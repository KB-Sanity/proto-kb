import type { IApplicationOptions } from 'pixi.js';
import { Application } from 'pixi.js';
import type { AppSettings } from '../interfaces';
import { ProtoAPI } from '../api';
import type { RootStore } from '../store';
import { builinPlugins } from '../plugins';
import { PluginsLoader } from './PluginsLoader';

export class ProtoKBApplication extends Application {
  public pluginsLoader: PluginsLoader;
  public api: ProtoAPI;

  constructor(options: IApplicationOptions, public readonly store: RootStore, public readonly settings: AppSettings) {
    super(options);

    this._initPluginsLoader();

    this.stage.sortableChildren = true;
  }

  private _initPluginsLoader(): void {
    this.api = new ProtoAPI(() => {
      for (const Plugin of builinPlugins) {
        this.pluginsLoader.applyPluginClass(new Plugin(this.api));
      }
    });

    this.pluginsLoader = new PluginsLoader(this.api);
    this.api.pluginsLoader = this.pluginsLoader.api;
  }
}
