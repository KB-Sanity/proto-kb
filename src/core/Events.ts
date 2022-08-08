import type { ProtoKBApplication } from './ProtoKBApplication';

export enum EVENT {
  KEY_SELECTED = 'key_selected',
}

export interface SystemEvent {
  [EVENT.KEY_SELECTED]: (keyId: string) => void;
}

export interface EventsAPI {
  subscribe<T extends keyof SystemEvent>(eventType: T, cb: SystemEvent[T]): void;
  unsubscribe<T extends keyof SystemEvent>(eventType: T, cb: SystemEvent[T]): void;
}

export class Events {
  private _subscribers: { [key in EVENT]?: SystemEvent[key][] } = {};

  private _api: EventsAPI;
  public get api(): EventsAPI {
    return this._api;
  }

  constructor(private _app: ProtoKBApplication) {
    this._initEventHandlers();

    const self = this;
    this._api = {
      get subscribe() {
        return self._subscribe;
      },
      get unsubscribe() {
        return self._unsubscribe;
      },
    };
  }

  private _initEventHandlers(): void {
    this._app.store.layout.listen((state, key) => {
      switch (key) {
        case 'selectedKey':
          this._processEvent(EVENT.KEY_SELECTED, state.selectedKey);
          break;
      }
    });
  }

  private _processEvent<T extends keyof SystemEvent>(event: T, value: Parameters<SystemEvent[T]>[0]): void {
    const subscribers = this._subscribers[event];
    for (const subscriber of subscribers) {
      subscriber(value);
    }
  }

  private _subscribe = <T extends keyof SystemEvent>(eventType: T, cb: SystemEvent[T]): void => {
    if (!this._subscribers[eventType]) {
      this._subscribers[eventType] = [];
    }

    this._subscribers[eventType].push(cb);
  };

  private _unsubscribe = <T extends keyof SystemEvent>(eventType: T, cb: SystemEvent[T]): void => {
    const index = this._subscribers[eventType].indexOf(cb);
    if (index > -1) {
      this._subscribers[eventType].splice(index, 1);
    }
  };
}
