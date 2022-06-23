import type { IApplicationOptions } from 'pixi.js';
import { Application } from 'pixi.js';
import type { AppSettings } from '../interfaces';
import type { ProtoAPI } from '../api';
import type { RootStore } from '../store';

export class ProtoKBApplication extends Application {
    constructor(options: IApplicationOptions, public readonly store: RootStore, public readonly settings: AppSettings, public readonly api: ProtoAPI) {
        super(options);

        this.stage.sortableChildren = true;
    }
}

