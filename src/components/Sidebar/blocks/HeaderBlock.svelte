<svelte:options immutable />

<script lang="ts">
  import type { FormHeaderBlock } from '../interfaces';

  export let data: FormHeaderBlock;
</script>

<svelte:element this={data.size} class="form-header" class:underline={data.underline}>{data.label}</svelte:element>

<style lang="scss">
  .form-header {
    margin: 5px 0px;

    &.underline {
      border-bottom: 1px solid #888;
    }
  }
</style>
