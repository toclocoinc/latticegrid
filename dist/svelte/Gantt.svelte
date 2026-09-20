<script>
  import { onMount, onDestroy, getContext } from 'svelte';
  import { createGantt } from '@toclocoinc/lattice-grid/modules/gantt';
  import { bindViewer, GRID_REGISTRY_KEY } from '@toclocoinc/lattice-grid/modules/svelte';

  let { class: klass = '', style = '', id = undefined, ...props } = $props();

  let el = $state(null);
  let published = $state(0);
  let binding = null;
  const registry = getContext(GRID_REGISTRY_KEY) ?? null;
  const unsubscribe = registry ? registry.subscribe(() => { published += 1; }) : null;

  export function instance() { return binding ? binding.instance : null; }

  onMount(() => {
    binding = bindViewer({ viewer: 'gantt', factory: createGantt, element: el, registry });
    binding.sync(props);
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
    if (binding) binding.destroy();
    binding = null;
  });

  $effect(() => {
    void published;
    const now = { ...props };
    if (binding) binding.sync(now);
  });
</script>

<div bind:this={el} class={klass} {style} {id}></div>
