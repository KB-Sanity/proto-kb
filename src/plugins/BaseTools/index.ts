import type { ProtoAPI } from 'src/api';
import type { ProtoPlugin } from 'src/ProtoPlugin';

export class BaseToolsPlugin implements ProtoPlugin {
  public static title = 'Base Tools';
  public static description = 'Base toolset such as: add key';
  public static id = 'com.protokb.base_tools';

  constructor(public api: ProtoAPI) {
    api.toolbar.registerButtons(this, [
      {
        name: 'Add Key',
        icon: 'Plus',
        onClick: () => api.layoutEditor.getKeyboard().addKeyCap(),
      },
    ]);
  }
}
