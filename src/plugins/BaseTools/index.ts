import type { ProtoAPI } from '../../api';
import { ProtoPlugin } from '../../core/ProtoPlugin';

export class BaseToolsPlugin extends ProtoPlugin {
  public static title = 'Base Tools';
  public static description = 'Base toolset such as: add key';
  public static id = 'com.protokb.base_tools';

  constructor(public api: ProtoAPI) {
    super(api);
    api.toolbar.registerButtons(this, [
      {
        name: 'Add Key',
        icon: 'Plus',
        onClick: () => api.layoutEditor.getKeyboard().addKeyCap(),
      },
    ]);
  }
}
