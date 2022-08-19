<script lang="ts">
  import { onMount } from 'svelte';
  import { Modals, closeModal } from 'svelte-modals';

  import type { AppSettings } from './interfaces';
  import Sidebar from './components/Sidebar/index.svelte';
  import LayoutEditor from './components/LayoutEditor/index.svelte';
  import { ProtoKBApplication } from './core/ProtoKBApplication';
  import { rootState } from './store';
  import { Events } from './core/Events';
  import { HTTPClient } from './core/http';
  import type { ProtoPlugin } from './core/ProtoPlugin';

  let layoutEditor: LayoutEditor;
  let app: ProtoKBApplication;
  let loading = true;

  onMount(async () => {
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

    const searchParams = new URLSearchParams(window.location.search);
    const searchParamsKeys = Array.from(searchParams.keys());
    if (searchParamsKeys.length) {
      const allPlugins = await HTTPClient.getPlugins();

      const foundedPlugins = allPlugins.filter((plugin) => searchParams.has(plugin.id));

      let instance: ProtoPlugin;
      for (const plugin of foundedPlugins) {
        instance = await app.pluginsLoader.loadPlugin(plugin.repo);
        if (instance.emit) {
          instance.emit('urlData', searchParams.get(plugin.id));
        }
      }
    }

    loading = false;
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
  {#if loading}
    <div class="loader">
      <!-- TODO move to static asset -->
      <svg
        version="1.1"
        id="L9"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 100 100"
        enable-background="new 0 0 0 0"
        xml:space="preserve">
        <path
          fill="#fff"
          d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            dur="1s"
            from="0 50 50"
            to="360 50 50"
            repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  {/if}
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

  .loader {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #ddd;
    justify-content: center;
    align-items: center;
    display: flex;

    svg {
      width: 200px;
    }
  }
</style>
