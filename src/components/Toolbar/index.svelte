<svelte:options immutable />

<script lang="ts">
  import type { ProtoKBApplication } from '../../entities/ProtoKBApplication';
  import { PlusIcon, DownloadIcon } from 'svelte-feather-icons';
  import { pickFile } from '../../lib/pickFile';
  import { parseData, type KLERows } from '../../lib/kle';

  export let app: ProtoKBApplication;

  const handleAddKeyClick = () => {
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
  };
</script>

<div class="toolbar">
  <button class="toolbar__button" on:click={handleAddKeyClick} >
    <PlusIcon size="24" />
    <span>Add Key</span>
  </button>

  <button class="toolbar__button _download" on:click={handleLoadKleLayout}>
    <DownloadIcon size="22" />
    <span>Load KLE layout</span>
  </button>
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

      &._download {
        padding: 4px;
      }
    }
  }
</style>
