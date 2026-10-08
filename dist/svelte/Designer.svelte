<script>
  import { onMount, onDestroy } from 'svelte';
  import { createDesigner } from '@toclocoinc/lattice-grid/modules/designer';
  import { bindDesigner } from '@toclocoinc/lattice-grid/modules/svelte';

  let { class: klass = '', style = '', id = undefined, ...props } = $props();

  let el = $state(null);
  let binding = null;

  export function instance() { return binding ? binding.instance : null; }

  onMount(() => {
    binding = bindDesigner({ createDesigner, element: el });
    binding.sync(props);
  });

  onDestroy(() => {
    if (binding) binding.destroy();
    binding = null;
  });

  $effect(() => {
    const now = { ...props };
    if (binding) binding.sync(now);
  });
</script>

<div bind:this={el} class={klass} {style} {id}></div>
