<svelte:options immutable />

<script lang="ts">
import type { ProtoKBApplication } from '../entities/ProtoKBApplication';
import { LayoutEditor } from './LayoutEditor';
import Toolbar from '../components/Toolbar/index.svelte';

let pixiContainer: HTMLDivElement;

let layoutEditor: LayoutEditor;
export let app: ProtoKBApplication;

$: {
  if (app && !layoutEditor) {
    layoutEditor = new LayoutEditor(app);
  }
}

export function getContainer(): HTMLDivElement {
  return pixiContainer;
}
</script>

<div class="pixi-container" bind:this={pixiContainer}>
  <div class="layout-editor">
    <Toolbar app={app} />
  </div>
</div>

<style lang="scss">
.pixi-container {
  height: 100%;
  flex: 1;
  position: relative;
}

.layout-editor {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  &__menu {
    pointer-events: all;
    padding: 10px;
    display: inline-block;
  }

  &__menu-button {
    display: flex;
    align-items: center;
    background: #efefef;
    border: none;
    border-radius: 15px;
    margin: 5px;
    padding: 3px;
    cursor: pointer;

    span {
      display: none;
      padding: 0 5px;
      font-weight: 600;
    }

    &:hover {
      span {
        display: block;
      }
    }

    &._download {
      padding: 4px;
    }
  }
}
</style>
