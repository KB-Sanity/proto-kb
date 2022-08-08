import type { KeyboardAPI } from '../../core/Keyboard';
import type { KeyCapData } from '../../core/KeyCap';

export interface KeyboardData {
  version: string;
  keyCaps: KeyCapData[];
  plugins: PluginsData;
}

interface PluginData {
  id: string;
  data: any;
}

type PluginsData = PluginData[];

export interface LayoutEditorAPI {
  getKeyboard(): KeyboardAPI;
  getKeyboardData(): KeyboardData;
  setKeyboardData(data: KeyboardData): Promise<void>;
}
