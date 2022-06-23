import type { ProtoAPI } from '../../api';
import { FORM_CONTROL, INPUT_CONTROL_TYPE, SIDEBAR_TAB_TRIGGER } from '../../components/Sidebar/constants';
import type { SidebarSchema, TabAPI } from '../../components/Sidebar/interfaces';
import type { ProtoPlugin } from '../../ProtoPlugin';

export class KeyParametersPlugin implements ProtoPlugin {
  public static title = 'Key Parameters';
  public static desctiption = 'Control keycap parameters like legends, colors etc.';
  public static id = 'com.protokb.key_parameters';

  private _sidebarLayout: SidebarSchema = [
    {
      control: FORM_CONTROL.INPUT,
      key: 'x',
      label: 'X',
      half: true,
      inline: true,
      step: 'any',
      type: INPUT_CONTROL_TYPE.NUMBER,
    },
    {
      control: FORM_CONTROL.INPUT,
      key: 'y',
      label: 'Y',
      half: true,
      inline: true,
      step: 'any',
      type: INPUT_CONTROL_TYPE.NUMBER,
    },
  ];

  constructor(public api: ProtoAPI) {
    api.sidebar.registerTab(this, this._sidebarLayout, {
      tabName: 'Key Parameters',
      trigger: SIDEBAR_TAB_TRIGGER.KEY_SELECTED,
      onCreate: this._handleCreate,
    });
  }

  private _handleCreate = (tabApi: TabAPI) => {
    const keyCap = this.api.layoutEditor.getKeyboard().getSelectedKeyCap();

    if (keyCap) {
      tabApi.patchValue({
        x: keyCap.x,
        y: keyCap.y,
      });
    }

    tabApi.subscribe(this._handleFormChange);
  };

  private _handleFormChange = (data: Record<string, any>, changedKey: string): void => {
    const keyCap = this.api.layoutEditor.getKeyboard().getSelectedKeyCap();

    if (keyCap) {
      if (changedKey === 'x' || changedKey === 'y') {
        keyCap.moveTo({
          ...keyCap.position,
          [changedKey]: data[changedKey],
        });
      }
    }
  };
}
