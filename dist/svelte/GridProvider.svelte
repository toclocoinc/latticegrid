<script>
  import { setContext } from 'svelte';
  import { createGridRegistry, GRID_REGISTRY_KEY } from '@toclocoinc/lattice-grid/modules/svelte';

  let { children } = $props();

  const registry = createGridRegistry();
  setContext(GRID_REGISTRY_KEY, registry);

  export function grids() { return registry; }
</script>

{@render children?.()}
