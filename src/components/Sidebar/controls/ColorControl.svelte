<svelte:options immutable />

<script lang="ts">
  import { nanoid } from 'nanoid';
  import { createEventDispatcher } from 'svelte';
  import type { ControlAPI, FormColorControl } from '../interfaces';

  const dispatch = createEventDispatcher();
  const id = nanoid();
  export let data: FormColorControl;
  export let value = '';

  const handleChange = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!e.currentTarget) {
      return;
    }
    setValue(e.currentTarget.value);
    dispatch('change', e.currentTarget.value);
  };

  const setValue = (val: string): void => {
    value = val;
  };

  const getValue = (): string => {
    return value;
  };

  export function getApi(): ControlAPI {
    return {
      get setValue() {
        return setValue;
      },
      get getValue() {
        return getValue;
      },
    };
  }
</script>

<div class="form-row" class:inline={data.inline === true} class:half={data.half === true}>
  <label for={id}>
    {data.label}
    {#if typeof data.description === 'string'}
      <span>({data.description})</span>
    {/if}
  </label>
  <input class="color-picker" {value} on:change={handleChange} {id} type="color" />
</div>

<style lang="scss" global>
  @import '../forms.scss';

  .color-picker {
    padding: 0;
  }
</style>
