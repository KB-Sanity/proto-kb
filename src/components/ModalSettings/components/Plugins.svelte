<svelte:options immutable />

<script lang="ts">
  import { HTTPClient, type ApiPlugin } from '../../../core/http';

  import { onMount } from 'svelte';
  import { CheckIcon, ClockIcon, PlusIcon } from 'svelte-feather-icons';
  import type { ProtoKBApplication } from '../../../core/ProtoKBApplication';

  export let app: ProtoKBApplication;

  let allPlugins: ApiPlugin[] = [];
  let filteredPlugins: ApiPlugin[] = [];
  let installingPlugin: string | null = null;

  onMount(async () => {
    allPlugins = filteredPlugins = await HTTPClient.getPlugins();
  });

  const installPlugin = async (plugin: ApiPlugin) => {
    installingPlugin = plugin.id;
    await app.pluginsLoader.loadPlugin(plugin.repo);
    installingPlugin = null;
  };

  const isInstalled = (pluginId: string) => {
    const res = app.pluginsLoader.isInstalled(pluginId);
    return res;
  };
</script>

<div class="plugins">
  <div class="plugins__actions">
    <input type="text" placeholder="Search plugin" class="plugins__search-field" />
  </div>
  <div class="plugins-list">
    {#each filteredPlugins as plugin}
      <div class="plugins-list__item">
        <div class="plugins-list__item-info">
          <b><a href={plugin.repo} target="_blank">{plugin.name}</a> <span>({plugin.id})</span></b>
          <span>{plugin.description}</span>
        </div>
        <div class="plugins-list__item-action">
          <button
            class="plugins-list__item-install"
            disabled={installingPlugin !== null || isInstalled(plugin.id)}
            on:click={() => installPlugin(plugin)}>
            {#key installingPlugin || isInstalled(plugin.id)}
              {#if installingPlugin === plugin.id}
                <ClockIcon size="20" />
              {:else if isInstalled(plugin.id)}
                <CheckIcon size="20" />
              {:else}
                <PlusIcon size="20" />
              {/if}
            {/key}
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .plugins {
    flex: 1;
    display: flex;
    flex-direction: column;

    &__search-field {
      border: 2px solid #888;
      outline: none;
      transition: border-color 0.3s linear;
      width: 100%;
      line-height: 20px;
      box-sizing: border-box;

      &:focus,
      &:active {
        border-color: #333;
      }
    }
  }

  .plugins-list {
    border: 1px solid #888;
    flex: 1;
    margin-top: 5px;

    &__item {
      display: flex;
      padding: 5px;
      border-bottom: 1px solid #ddd;
    }

    &__item-info {
      display: flex;
      flex-direction: column;
      font-size: 14px;
      flex: 1;

      & > b {
        & > span {
          color: #999;
          font-weight: 500;
          font-size: 13px;
        }
      }

      & > span {
        font-size: 13px;
        margin-top: 3px;
      }
    }

    &__item-install {
      display: flex;
      align-items: center;
      background: #efefef;
      border: none;
      border-radius: 15px;
      margin: 5px;
      padding: 3px;
      cursor: pointer;
    }
  }
</style>
