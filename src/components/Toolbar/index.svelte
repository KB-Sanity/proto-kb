<svelte:options immutable />

<script lang="ts">
  import type { ProtoKBApplication } from '../../entities/ProtoKBApplication';
  import * as FeatherIcons from 'svelte-feather-icons';
  import type { ProtoPlugin } from 'src/ProtoPlugin';
  import type { ToolbarButton, ToolbarButtonOptions } from './interfaces';

  let buttons: ToolbarButton[] = [];

  export let app: ProtoKBApplication;

  const registerButtons = <T extends ProtoPlugin>(plugin: T, btns: ToolbarButtonOptions[]): void => {
    const pluginId = (<typeof ProtoPlugin>plugin.constructor).id;
    const isButtonsRegistered = buttons.find((item) => item.plugin === pluginId);
    if (isButtonsRegistered) {
      return console.warn(`Toolbar buttons for plugin with id ${pluginId} already registered.`);
    }

    buttons = [...buttons, ...btns.map((button) => ({ plugin: pluginId, options: button }))];
  };

  $: {
    if (app) {
      app.api.toolbar = {
        get registerButtons() {
          return registerButtons;
        },
      };
    }
  }

  /* const handleAddKeyClick = () => {
    app.api.layoutEditor.getKeyboard().addKeyCap();
  };

  const handleLoadKleLayout = () => {
    pickFile('application/JSON').then((file) => {
      const fileReader = new FileReader();
      fileReader.onload = (event: ProgressEvent) => {
        const reader = event.target as FileReader;
        if (reader.result) {
          const rows: KLERows = JSON.parse(reader.result as string);
          for (const key of parseData(rows)) {
            if ('position' in key) {
              app.api.layoutEditor.getKeyboard().addKeyCap({
                position: key.position,
                size: key.size,
                pivot: key.pivot,
                angle: key.angle,
                legends: key.legends,
                color: key.color,
              });
            } else {
              app.api.layoutEditor.getKeyboard().setMetadata(key);
            }
          }
        }
      };
      fileReader.readAsText(file);
    });
  };*/
</script>

<div class="toolbar">
  {#each buttons as button}
    <button class="toolbar__button" on:click={() => button.options?.onClick()}>
      <svelte:component
        this={FeatherIcons[`${button.options.icon}Icon`]}
        size={button.options.size ? String(button.options.size) : '24'} />
      <span>{button.options.name}</span>
    </button>
  {/each}
  <!--<button class="toolbar__button" on:click={handleAddKeyClick}>
    <svelte:component this={FeatherIcons[`${'Plus'}Icon`]} size="24" />
    <span>Add Key</span>
  </button>

  <button class="toolbar__button _download" on:click={handleLoadKleLayout}>
    <svelte:component this={FeatherIcons[`${'Download'}Icon`]} size="22" />
    <span>Load KLE layout</span>
  </button>-->
</div>

<style lang="scss">
  .toolbar {
    pointer-events: all;
    padding: 10px;
    display: inline-block;

    &__button {
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
    }
  }
</style>
