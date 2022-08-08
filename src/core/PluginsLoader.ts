import GitUrlParse from 'git-url-parse';
import type { ProtoAPI } from 'src/api';
import type { ProtoPlugin } from './ProtoPlugin';
import { HTTPClient } from './http';
import { builinPlugins } from '../plugins';

export interface Plugin<T extends ProtoPlugin = ProtoPlugin> {
  name: string;
  description: string;
  id: string;
  url?: string;
  instance: T;
}

export interface PluginsLoaderAPI {
  getPlugins(): string[];
  getExternalPlugins(): string[];
  getPluginApi(id: string): any;
  getPluginInfo(id: string): Omit<Plugin, 'instance'>;
  getPluginData(id: string): any;
}

export class PluginsLoader {
  private _plugins: Plugin[] = [];

  private _api: PluginsLoaderAPI;
  public get api(): PluginsLoaderAPI {
    return this._api;
  }

  constructor(private readonly _protoApi: ProtoAPI) {
    const self = this;
    this._api = {
      get getPlugins() {
        return self._getPlugins;
      },
      get getExternalPlugins() {
        return self._getExternalPlugins;
      },
      get getPluginApi() {
        return self._getPluginApi;
      },
      get getPluginData() {
        return self._getPluginData;
      },
      get getPluginInfo() {
        return self._getPluginInfo;
      },
    };
  }

  private _getPlugins: PluginsLoaderAPI['getPlugins'] = () => {
    return this._plugins.map((item) => item.id);
  };

  private _getExternalPlugins: PluginsLoaderAPI['getExternalPlugins'] = () => {
    const internalPlugins = builinPlugins.map((plugin) => plugin.id);
    return this._getPlugins().filter((plugin) => !internalPlugins.includes(plugin));
  };

  private _getPluginApi: PluginsLoaderAPI['getPluginApi'] = (id: string): any => {
    const plugin = this._plugins.find((item) => item.id === id);
    return plugin ? plugin.instance.getApi?.() : null;
  };

  private _getPluginData: PluginsLoaderAPI['getPluginData'] = (id: string): any => {
    const plugin = this._plugins.find((item) => item.id === id);
    return plugin ? plugin.instance.getData?.() : null;
  };

  private _getPluginInfo: PluginsLoaderAPI['getPluginInfo'] = (id: string) => {
    const plugin = this._plugins.find((item) => item.id === id);
    const { instance: _, ...info } = plugin;
    return info;
  };

  public async loadPlugin(pluginUrl: string): Promise<ProtoPlugin> {
    const urlData = GitUrlParse(pluginUrl);
    const packageData = await HTTPClient.fetchPluginPackageFile(urlData.owner, urlData.name);
    const sourceCode = await HTTPClient.fetchPluginSourceFile(urlData.owner, urlData.name, packageData.main);
    const context = {};
    const template = `
      let globalThis = window = this;
      return ${sourceCode}
    `;

    new Function(template).bind(context)();
    const PluginClass: new (api: ProtoAPI) => ProtoPlugin = context[packageData.name];
    const instance = this.applyPluginClass(new PluginClass(this._protoApi), pluginUrl);
    return instance;
  }

  public applyPluginClass<T extends ProtoPlugin>(instance: T, url?: string): T {
    const staticClass = <typeof ProtoPlugin>instance.constructor;
    const data = {
      name: staticClass.name,
      description: staticClass.description,
      id: staticClass.id,
      url,
      instance,
    };
    this._plugins.push(data);
    return instance;
  }

  public isInstalled(id: string): boolean {
    return Boolean(this._plugins.find((plugin) => plugin.id === id));
  }
}
