<script lang="ts">
  import { onMount } from 'svelte';

  import type { AppSettings } from './interfaces';
  import Sidebar from './components/Sidebar/index.svelte';
  import LayoutEditor from './editor/LayoutEditor.svelte';
  import { ProtoKBApplication } from './entities/ProtoKBApplication';
  import { rootState } from './store';
  import { ProtoAPI } from './api';
  import { Events } from './entities/Events';
  import { builinPlugins } from './plugins';

  let layoutEditor: LayoutEditor;
  let app: ProtoKBApplication;

  const api = new ProtoAPI(() => {
    for (const Plugin of builinPlugins) {
      new Plugin(api);
    }
  });
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
      appSettings,
      api
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
  }
</style>
