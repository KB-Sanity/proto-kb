import GitUrlParse from 'git-url-parse';
import type { ProtoAPI } from 'src/api';
import type { ProtoPlugin } from 'src/ProtoPlugin';
import { HTTPClient } from '../http';

interface Plugin {
  name: string;
  description: string;
  id: string;
  instance: ProtoPlugin;
}

export class PluginsLoader {
  private _plugins: Plugin[] = [];

  constructor(private readonly _api: ProtoAPI) {}

  public async loadPlugin(pluginUrl): Promise<void> {
    const urlData = GitUrlParse(pluginUrl);
    const packageData = await HTTPClient.fetchPluginPackageFile(urlData.owner, urlData.name);
    const sourceCode = await HTTPClient.fetchPluginSourceFile(urlData.owner, urlData.name, packageData.main);
    const context = {};
    const template = `
      let globalThis = window = this;
      return ${sourceCode}
    `;

    new Function(template).bind(context)();
    this.applyPluginClass(context[packageData.name]);
  }

  public applyPluginClass<T>(c: T): void {
    const Class = c as unknown as typeof ProtoPlugin; // TODO fix typings
    this._plugins.push({
      name: Class.name,
      description: Class.description,
      id: Class.id,
      instance: new Class(this._api),
    });
  }

  public isInstalled(id: string): boolean {
    return Boolean(this._plugins.find((plugin) => plugin.id === id));
  }
}
