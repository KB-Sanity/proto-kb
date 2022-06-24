<svelte:options immutable />

<script lang="ts">
  import { tick } from 'svelte';
  import { EVENT } from '../../entities/Events';
  import type { ProtoKBApplication } from '../../entities/ProtoKBApplication';
  import type { ProtoPlugin } from '../../ProtoPlugin';
  import HeaderBlock from './blocks/HeaderBlock.svelte';
  import { FORM_BLOCK, FORM_CONTROL, SIDEBAR_TAB_TRIGGER } from './constants';
  import ColorControl from './controls/ColorControl.svelte';
  import InputControl from './controls/InputControl.svelte';
  import SelectControl from './controls/SelectControl.svelte';
  import type {
    ControlAPI,
    FormControl,
    SidebarSchema,
    SidebarTab,
    SidebarTabOptions,
    Subscription,
    TabAPI,
  } from './interfaces';

  const controlComponents = {
    [FORM_CONTROL.INPUT]: InputControl,
    [FORM_CONTROL.SELECT]: SelectControl,
    [FORM_CONTROL.COLOR]: ColorControl,
  };

  const blockComponents = {
    [FORM_BLOCK.HEADER]: HeaderBlock,
  };

  let shownTabs: SidebarTab[] = [];
  let currentTab: SidebarTab | null;
  let currentContent: Record<string, InputControl | SelectControl> = {};
  let currentTabValue: Record<string, any> = {};
  let subscriptions: Subscription[] = [];
  let tabs: SidebarTab[] = [];

  export let app: ProtoKBApplication;

  const getControl = (pluginId: string, key: string): ControlAPI => {
    if (currentTab.plugin !== pluginId || !currentContent[key]) {
      return undefined;
    }

    return currentContent[key].getApi();
  };

  const subscribe = (pluginId: string, cb: Subscription) => {
    if (currentTab.plugin !== pluginId) {
      return undefined;
    }

    subscriptions.push(cb);
  };

  const unsubscribe = (pluginId: string, cb: Subscription) => {
    if (currentTab.plugin !== pluginId) {
      return undefined;
    }

    const index = subscriptions.indexOf(cb);
    if (index > -1) {
      subscriptions.splice(index, 1);
    }
  };

  const patchValue = (pluginId: string, value: Record<string, any>): void => {
    if (currentTab.plugin !== pluginId) {
      return undefined;
    }

    currentTabValue = { ...currentTabValue, ...value };
  };

  const getTabApi = (pluginId: string): TabAPI => {
    return {
      get get() {
        return (key: string) => getControl(pluginId, key);
      },
      get subscribe() {
        return (cb: Subscription) => subscribe(pluginId, cb);
      },
      get unsubscribe() {
        return (cb: Subscription) => unsubscribe(pluginId, cb);
      },
      get patchValue() {
        return (value: Record<string, any>) => patchValue(pluginId, value);
      },
    };
  };

  const registerTab = <T extends ProtoPlugin>(
    plugin: T,
    schema: SidebarSchema,
    options: SidebarTabOptions
  ): TabAPI | void => {
    const pluginId = (<typeof ProtoPlugin>plugin.constructor).id;
    const isExistLayout = tabs.find((item) => item.plugin === pluginId);
    if (isExistLayout) {
      return console.warn(`Sidebar layout for plugin with id ${pluginId} already registered.`);
    }

    const tab: SidebarTab = {
      plugin: pluginId,
      options,
      schema,
    };

    tabs = [...tabs, tab];

    return getTabApi(pluginId);
  };

  const handleTabClick = async (tab: SidebarTab | null) => {
    currentContent = {};
    currentTabValue = {};
    subscriptions = [];
    currentTab = tab;
    await tick();
    if (currentTab && currentTab.options.onCreate) {
      currentTab.options.onCreate(getTabApi(tab.plugin));
    }
  };

  const handleControlChange = (control: FormControl, value) => {
    for (const subscription of subscriptions) {
      subscription({ ...currentTabValue }, control.key);
    }
  };

  $: {
    if (app) {
      app.api.sidebar = {
        get registerTab() {
          return registerTab;
        },
      };

      app.api.events.subscribe(EVENT.KEY_SELECTED, (keyId: string) => {
        if (keyId !== null) {
          shownTabs = [
            ...shownTabs,
            ...tabs.filter((item) => item.options.trigger === SIDEBAR_TAB_TRIGGER.KEY_SELECTED),
          ];
        } else {
          shownTabs = shownTabs.filter((item) => item.options.trigger !== SIDEBAR_TAB_TRIGGER.KEY_SELECTED);
        }
        const isExistCurrentTab = currentTab && shownTabs.find((tab) => tab.plugin === currentTab.plugin);
        if (!shownTabs.length) {
          handleTabClick(null);
        } else if (!currentTab || (currentTab && !isExistCurrentTab)) {
          handleTabClick(shownTabs[0]);
        } else if (currentTab && isExistCurrentTab) {
          handleTabClick(currentTab);
        }
      });
    }
  }
</script>

{#if shownTabs.length > 0}
  <div class="sidebar">
    <div class="sidebar__content">
      {#if currentTab}
        {#each currentTab.schema as control}
          {#if 'control' in control}
            <svelte:component
              this={controlComponents[control.control]}
              bind:this={currentContent[control.key]}
              bind:value={currentTabValue[control.key]}
              on:change={(value) => handleControlChange(control, value)}
              data={control} />
          {:else if 'block' in control}
            <svelte:component this={blockComponents[control.block]} data={control} />
          {/if}
        {/each}
      {/if}
    </div>
    <div class="sidebar__tabs">
      {#each tabs as tab}
        <div
          class="sidebar__tab"
          class:_active={tab.plugin === currentTab?.plugin}
          on:click={() => handleTabClick(tab)}>
          {tab.options.tabName}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .sidebar {
    display: flex;
    width: 300px;
    background: #eee;
    border-left: 1px solid #ddd;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;

    &__content {
      flex: 1;
      padding: 10px 5px;
    }

    &__tabs {
      background: #e2e2e2;
    }

    &__tab {
      writing-mode: vertical-lr;
      padding: 7px 2px;
      outline: none;
      cursor: pointer;
      border-bottom: 1px solid #bbb;

      &._active {
        background: #bbb;
      }
    }

    &__form-row {
      padding: 0 5px 5px;
      position: relative;

      & > label {
        font-size: 15px;
        font-weight: 600;
      }

      input {
        border: 2px solid #888;
        outline: none;
        transition: border-color 0.3s linear;
        width: 100%;
        line-height: 20px;
        box-sizing: border-box;
      }

      & > input {
        display: block;
      }

      &.inline,
      &.inline.half {
        display: inline-flex;
        align-items: center;

        & > label {
          margin-right: 5px;
        }
      }

      &.half {
        box-sizing: border-box;
        width: 50%;
        display: inline-block;
      }
    }
  }
</style>
