<script>
  import { setContext, onDestroy } from 'svelte';
  import { createDataRouter } from '@toclocoinc/lattice-grid/modules/data-router';
  import { createRouterHandle, ROUTER_KEY } from '@toclocoinc/lattice-grid/modules/svelte';

  let { config = {}, children } = $props();

  const handle = createRouterHandle({ createDataRouter, config: () => config });
  setContext(ROUTER_KEY, handle);

  export function router() { return handle.router; }

  onDestroy(() => handle.destroy());
</script>

{@render children?.()}
