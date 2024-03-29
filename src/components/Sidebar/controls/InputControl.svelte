<svelte:options immutable />

<script lang="ts">
  import { nanoid } from 'nanoid';
  import { createEventDispatcher } from 'svelte';
  import type { ControlAPI, FormInputControl } from '../interfaces';

  const id = nanoid();
  const dispatch = createEventDispatcher();

  export let data: FormInputControl;
  export let value: string | number = '';

  $: type = data.type || 'number';

  const setValue = (val: string | number): void => {
    value = type ? Number(val) : val;
  };

  const getValue = (): string | number => {
    return (value = type ? Number(value) : value);
  };

  const handleChange = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (!e.currentTarget) {
      return;
    }
    setValue(e.currentTarget.value);
    dispatch('change', getValue());
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
  <input {value} step={data.step || 'any'} min={data.min} max={data.max} on:change={handleChange} {id} {type} />
</div>

<style lang="scss" global>
  @import '../forms.scss';
</style>
