import { createNanoEvents, type Emitter } from 'nanoevents';
import type { ProtoAPI } from 'src/api';

interface PluginEvents {
  urlData: (data: string) => void;
}

export abstract class ProtoPlugin<API = any, DATA = any> {
  public static title: string;
  public static description: string;
  public static id: string;

  private emitter: Emitter;

  constructor(public api: ProtoAPI) {
    this.emitter = createNanoEvents<PluginEvents>();
  }

  public getApi?(): API;
  public getData?(): DATA;
  public setData?(data: DATA): void;

  on<E extends keyof PluginEvents>(event: E, callback: PluginEvents[E]) {
    return this.emitter.on(event, callback);
  }

  emit<E extends keyof PluginEvents>(event: E, ...args: Parameters<PluginEvents[E]>) {
    return this.emitter.emit(event, ...args);
  }
}
