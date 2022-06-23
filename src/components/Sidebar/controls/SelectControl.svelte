<svelte:options immutable />

<script lang="ts">
  import { nanoid } from 'nanoid';
  import { createEventDispatcher } from 'svelte';
  import type { ControlAPI, FormSelectControl } from '../interfaces';

  const dispatch = createEventDispatcher();
  const id = nanoid();
  export let data: FormSelectControl;
  export let value = '';

  const handleChange = (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
    if (!e.currentTarget) {
      return;
    }
    dispatch('change', e.currentTarget.value);
  };

  const setValue = (val: string | number): void => {
    value = String(val);
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

<div class="form-row">
  <label for={id}>
    {data.label}
    {#if typeof data.description === 'string'}
      <span>({data.description})</span>
    {/if}
  </label>
  <select bind:value on:change={handleChange}>
    {#each data.options as option}
      <option value={option.value}>{option.title}</option>
    {/each}
  </select>
</div>

<style lang="scss" global>
  @import '../forms.scss';
</style>
