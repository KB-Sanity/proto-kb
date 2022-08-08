import type { ProtoPlugin } from '../../core/ProtoPlugin';
import type { FORM_BLOCK, FORM_CONTROL, INPUT_CONTROL_TYPE, SIDEBAR_TAB_TRIGGER } from './constants';

export interface ControlAPI {
  setValue(value: any): void;
  getValue(): any;
}

export interface TabAPI {
  get(key: string): ControlAPI;
  subscribe(cb: Subscription): void;
  unsubscribe(cb: Subscription): void;
  patchValue(value: Record<string, any>): void;
}

export interface SidebarAPI {
  registerTab<T extends ProtoPlugin>(plugin: T, schema: SidebarSchema, options: SidebarTabOptions): TabAPI | void;
}

export type Subscription = (data: any, changedField: string) => void;

export interface SidebarTabOptions {
  tabName: string;
  trigger: SIDEBAR_TAB_TRIGGER;
  onTrigger?: () => void;
  onCreate?: (tabApi: TabAPI) => void;
  onDestroy?: () => void;
}

export interface SidebarTab {
  plugin: string;
  options: SidebarTabOptions;
  schema: SidebarSchema;
}

export type SidebarSchema = (FormControl | FormBlock)[];

export type FormBlock = FormHeaderBlock;

export type FormControl = FormInputControl | FormSelectControl | FormColorControl;

export interface FormHeaderBlock {
  block: FORM_BLOCK.HEADER;
  size: `h${1 | 2 | 3 | 4 | 5 | 6}`;
  label: string;
  underline?: boolean;
}

export interface FormColorControl {
  control: FORM_CONTROL.COLOR;
  label: string;
  key: string;
  default?: string;
  description?: string;
  inline?: boolean;
  half?: boolean;
}

export interface FormInputControl {
  control: FORM_CONTROL.INPUT;
  label: string;
  key: string;
  type?: INPUT_CONTROL_TYPE;
  min?: number;
  max?: number;
  step?: number | string;
  default?: string | number;
  inline?: boolean;
  half?: boolean;
  description?: string;
}

export interface FormSelectControlOption {
  title: string;
  value: string | number;
}

export interface FormSelectControl {
  control: FORM_CONTROL.SELECT;
  options: FormSelectControlOption[];
  label: string;
  key: string;
  description?: string;
  default?: string;
}
