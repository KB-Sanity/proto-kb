import { saveFile } from '../../lib/file';
import type { ProtoAPI } from '../../api';
import { ProtoPlugin } from '../../core/ProtoPlugin';
import type { KeyboardData } from 'src/components/LayoutEditor/interfaces';

export class ImportExportPlugin extends ProtoPlugin {
  public static title = 'Import/Export';
  public static description = 'Import/export your keyboard';
  public static id = 'com.protokb.import_export';

  constructor(public api: ProtoAPI) {
    super(api);
    api.toolbar.registerButtons(this, [
      {
        name: 'Import Keyboard',
        icon: 'Download',
        onClick: this._importKeyboard,
      },
      {
        name: 'Export Keyboard',
        icon: 'Share',
        onClick: this._exportKeyboard,
      },
    ]);
  }

  private _importKeyboard = async (): Promise<void> => {
    const file = await this.api.utils.pickFile('application/JSON');
    const fileContent = await this.api.utils.fileToText(file);
    const data = JSON.parse(fileContent.toString()) as KeyboardData;
    await this.api.layoutEditor.setKeyboardData(data);
  };

  private _exportKeyboard = (): void => {
    const data = this.api.layoutEditor.getKeyboardData();
    saveFile(JSON.stringify(data, null, 2), 'keyboard.json');
  };
}
