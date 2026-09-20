<script>
  import { onMount, onDestroy, getContext } from 'svelte';
  import { createGrid } from '@toclocoinc/lattice-grid';
  import { bindGrid, GRID_REGISTRY_KEY, ROUTER_KEY } from '@toclocoinc/lattice-grid/modules/svelte';

  let { class: klass = '', style = '', id = undefined, ...props } = $props();

  let el = $state(null);
  let binding = null;
  const registry = getContext(GRID_REGISTRY_KEY) ?? null;
  const router = getContext(ROUTER_KEY) ?? null;

  export function grid() { return binding ? binding.grid : null; }

  onMount(() => {
    binding = bindGrid({ createGrid, element: el, props, registry, router });
  });

  onDestroy(() => {
    if (binding) binding.destroy(props);
    binding = null;
  });

  $effect(() => {
    const now = { ...props };
    if (binding) binding.update(now);
  });
</script>

<div bind:this={el} class={klass} {style} {id}></div>
