import type { ProtoPlugin } from 'src/ProtoPlugin';
import type * as FeatherIcons from 'svelte-feather-icons';

export type ToolbarButtonIcon<IconName extends string> = IconName extends `${infer Name}Icon` ? Name : null;

export interface ToolbarButtonOptions {
  name: string;
  icon: ToolbarButtonIcon<keyof typeof FeatherIcons>;
  size?: number;
  onClick?: () => void;
}

export interface ToolbarButton {
  plugin: string;
  options: ToolbarButtonOptions;
}

export interface ToolbarAPI {
  registerButtons<T extends ProtoPlugin>(plugin: T, btns: ToolbarButtonOptions[]): void;
}
