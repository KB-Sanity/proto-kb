<script lang="ts">
  import { onMount } from 'svelte';
  import { Modals, closeModal } from 'svelte-modals';

  import type { AppSettings } from './interfaces';
  import Sidebar from './components/Sidebar/index.svelte';
  import LayoutEditor from './components/LayoutEditor/index.svelte';
  import { ProtoKBApplication } from './core/ProtoKBApplication';
  import { rootState } from './store';
  import { Events } from './core/Events';

  let layoutEditor: LayoutEditor;
  let app: ProtoKBApplication;

  onMount(() => {
    const pixiContainer = layoutEditor.getContainer();

    const appSettings: AppSettings = {
      unitSize: 70,
      keyCapCornerRadius: 0.1,
    };

    app = new ProtoKBApplication(
      {
        backgroundColor: 0xffffff,
        resolution: window.devicePixelRatio,
        antialias: true,
        autoDensity: true,
        resizeTo: pixiContainer,
        width: pixiContainer.clientWidth,
        height: pixiContainer.clientHeight,
      },
      rootState,
      appSettings
    );

    app.api.events = new Events(app).api;

    pixiContainer.appendChild(app.view);
  });
</script>

<main>
  <div class="layout-editor">
    <LayoutEditor bind:this={layoutEditor} {app} />
    <Sidebar {app} />
  </div>
  <Modals>
    <div slot="backdrop" class="backdrop" on:click={closeModal} />
  </Modals>
</main>

<style lang="scss">
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .layout-editor {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
