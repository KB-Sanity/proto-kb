import { map } from 'nanostores';

export interface LayoutStore {
  layout: Record<string, any>[]; // TODO
  selectedKey: string | null;
}

export const layoutStore = map<LayoutStore>({
  layout: [],
  selectedKey: null,
});

function selectKey(keyId: string | null): void {
  layoutStore.setKey('selectedKey', keyId);
}

export const layoutActions = {
  selectKey,
};
