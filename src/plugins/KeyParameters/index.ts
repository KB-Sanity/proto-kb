import type { ProtoAPI } from '../../api';
import { FORM_BLOCK, FORM_CONTROL, SIDEBAR_TAB_TRIGGER } from '../../components/Sidebar/constants';
import type { SidebarSchema, TabAPI } from '../../components/Sidebar/interfaces';
import type { ProtoPlugin } from '../../ProtoPlugin';

export class KeyParametersPlugin implements ProtoPlugin {
  public static title = 'Key Parameters';
  public static desctiption = 'Control keycap parameters like legends, colors etc.';
  public static id = 'com.protokb.key_parameters';

  private _sidebarLayout: SidebarSchema = [
    {
      block: FORM_BLOCK.HEADER,
      size: 'h5',
      label: 'Position',
      underline: true,
    },

    {
      control: FORM_CONTROL.INPUT,
      key: 'x',
      label: 'X',
      half: true,
      inline: true,
    },
    {
      control: FORM_CONTROL.INPUT,
      key: 'y',
      label: 'Y',
      half: true,
      inline: true,
    },

    {
      block: FORM_BLOCK.HEADER,
      size: 'h5',
      label: 'Size',
      underline: true,
    },

    {
      control: FORM_CONTROL.INPUT,
      key: 'width',
      label: 'X',
      half: true,
      inline: true,
    },
    {
      control: FORM_CONTROL.INPUT,
      key: 'height',
      label: 'Y',
      half: true,
      inline: true,
    },

    {
      block: FORM_BLOCK.HEADER,
      size: 'h5',
      label: 'Pivot and angle',
      underline: true,
    },

    {
      control: FORM_CONTROL.INPUT,
      key: 'pivot_x',
      label: 'X',
      half: true,
      inline: true,
    },
    {
      control: FORM_CONTROL.INPUT,
      key: 'pivot_y',
      label: 'Y',
      half: true,
      inline: true,
    },
    {
      control: FORM_CONTROL.INPUT,
      key: 'angle',
      label: 'Angle',
      inline: true,
    },

    {
      block: FORM_BLOCK.HEADER,
      size: 'h5',
      label: 'Color',
      underline: true,
    },

    {
      control: FORM_CONTROL.COLOR,
      label: 'Keycap',
      key: 'color',
      inline: true,
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
        width: keyCap.width,
        height: keyCap.height,
        pivot_x: keyCap.pivot.x,
        pivot_y: keyCap.pivot.y,
        angle: keyCap.angle,
        color: keyCap.color,
      });
    }

    tabApi.subscribe(this._handleFormChange);
  };

  // TODO: refactor
  private _handleFormChange = (data: Record<string, any>, changedKey: string): void => {
    const keyCap = this.api.layoutEditor.getKeyboard().getSelectedKeyCap();
    if (keyCap) {
      switch (changedKey) {
        case 'x':
        case 'y':
          keyCap.moveTo({
            ...keyCap.position,
            [changedKey]: data[changedKey],
          });
          break;

        case 'width':
        case 'height':
          keyCap.setSize({
            ...keyCap.size,
            [changedKey]: data[changedKey],
          });
          break;

        case 'pivot_x':
        case 'pivot_y': {
          const key = changedKey === 'pivot_x' ? 'x' : 'y';
          keyCap.setPivot({
            ...keyCap.pivot,
            [key]: data[changedKey],
          });
          break;
        }

        case 'angle':
          keyCap.setAngle(data[changedKey] as number);
          break;

        case 'color':
          keyCap.setColor(data[changedKey] as string);
          break;
      }
    }
  };
}
