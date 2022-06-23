import type { SidebarAPI } from "../components/Sidebar/interfaces";
import type { LayoutEditorAPI } from "../editor/LayoutEditorAPI";
import type { EventsAPI } from "../entities/Events";

const apiList = ['layoutEditor', 'sidebar', 'events'];

export class ProtoAPI {
  private _layoutEditor: LayoutEditorAPI;
  public get layoutEditor(): LayoutEditorAPI { return this._layoutEditor }
  public set layoutEditor(api: LayoutEditorAPI) {
    if (!this._layoutEditor) {
      this._layoutEditor = api;
      this._checkApiStatus();
    }
  }

  private _sidebar: SidebarAPI;
  public get sidebar(): SidebarAPI { return this._sidebar }
  public set sidebar(api: SidebarAPI) {
    if (!this._sidebar) {
      this._sidebar = api;
      this._checkApiStatus();
    }
  }

  private _events: EventsAPI;
  public get events(): EventsAPI { return this._events }
  public set events(api: EventsAPI) {
    if (!this._events) {
      this._events = api;
      this._checkApiStatus();
    }
  }

  constructor(private _initializedCb: () => void) {}

  private _checkApiStatus(): void {
    for (const api of apiList) {
      if (!this[api]) {
        return;
      }
    }
    this._initializedCb();
  }
}
