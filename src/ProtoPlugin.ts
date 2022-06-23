import type { ProtoAPI } from './api';

export class ProtoPlugin {
  public static title: string;
  public static description: string;
  public static id: string;

  constructor(public api: ProtoAPI) {}
}
