<script lang="ts">
  import type { ProtoKBApplication } from '../../core/ProtoKBApplication';

  import { XIcon } from 'svelte-feather-icons';
  import { closeModal } from 'svelte-modals';
  import Plugins from './components/Plugins.svelte';

  export let isOpen;
  export let app: ProtoKBApplication;

  enum TAB {
    PLUGINS,
    GITHUB,
  }

  const tabComponents = {
    [TAB.PLUGINS]: Plugins,
  };
  let openedTab = TAB.PLUGINS;

  const openPluginTab = () => (this.openedTab = TAB.PLUGINS);
  const openGitHubTab = () => (this.openedTab = TAB.GITHUB);
</script>

{#if isOpen}
  <div role="dialog" class="modal">
    <div class="body">
      <div class="header">
        <h3>Settings</h3>
        <button class="close-button" on:click={closeModal}>
          <XIcon size="20" />
        </button>
      </div>
      <div class="content">
        <div class="tabs">
          <button class="tab" class:active={openedTab == TAB.PLUGINS} on:click={openPluginTab}> Plugins </button>
          <button class="tab" class:active={openedTab == TAB.GITHUB} on:click={openGitHubTab}> GitHub </button>
        </div>
        <div class="tab-content">
          <svelte:component this={tabComponents[openedTab]} {app} />
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    color: #444;
  }

  .body {
    min-width: 550px;
    min-height: 350px;
    border-radius: 6px;
    padding: 10px;
    background: white;
    display: flex;
    flex-direction: column;
    pointer-events: auto;

    .content {
      display: flex;
      flex: 1;

      .tab-content {
        flex: 1;
        padding: 5px 0px 5px 10px;
        display: flex;
        flex-direction: column;
      }

      .tabs {
        display: flex;
        flex-direction: column;
        border-right-width: 1px;
        border-right-style: solid;
        border-image: linear-gradient(
            0deg,
            rgb(255, 255, 255) 0%,
            rgb(255, 255, 255) 5%,
            rgb(187, 187, 187) 30%,
            rgb(187, 187, 187) 70%,
            rgb(255, 255, 255) 95%,
            rgb(255, 255, 255) 100%
          )
          1;

        .tab {
          background: none;
          border: none;
          font-size: 16px;
          min-width: 130px;
          padding: 10px 20px;
          border-bottom-width: 1px;
          border-bottom-style: solid;
          border-image: linear-gradient(
              90deg,
              rgb(255, 255, 255) 0%,
              rgb(255, 255, 255) 5%,
              rgb(187, 187, 187) 30%,
              rgb(187, 187, 187) 70%,
              rgb(255, 255, 255) 95%,
              rgb(255, 255, 255) 100%
            )
            1;
          color: #444;
          cursor: pointer;

          &.active {
            background: #f5f5f5;
          }

          &:hover {
            background: #ededed;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .header {
      display: flex;

      h3 {
        margin: 0px;
        margin-bottom: 5px;
        flex: 1;
      }

      .close-button {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
      }
    }
  }
</style>
