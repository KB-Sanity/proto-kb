import type { MapStore } from 'nanostores';
import { layoutStore, type LayoutStore } from './layout';
export { layoutActions } from './layout';

export interface RootStore {
  layout: MapStore<LayoutStore>;
}

export const rootState: RootStore = {
  layout: layoutStore,
};
