import type {KeyboardAPI} from '../entities/Keyboard';
import type {LayoutEditor} from './LayoutEditor';

export class LayoutEditorAPI {
  constructor(private _layoutEditor: LayoutEditor) {}

  public getKeyboard(): KeyboardAPI {
    return this._layoutEditor.keyboard.api;
  }
}
