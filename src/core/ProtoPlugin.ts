import type { ProtoAPI } from 'src/api';

export abstract class ProtoPlugin<API = any, DATA = any> {
  public static title: string;
  public static description: string;
  public static id: string;

  constructor(public api: ProtoAPI) {}

  public getApi?(): API;
  public getData?(): DATA;
  public setData?(data: DATA): void;
}
