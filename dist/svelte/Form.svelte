<script>
  import { onMount, onDestroy } from 'svelte';
  import { createForm } from '@toclocoinc/lattice-grid/modules/form';
  import { bindViewer } from '@toclocoinc/lattice-grid/modules/svelte';

  let { class: klass = '', style = '', id = undefined, ...props } = $props();

  let el = $state(null);
  let binding = null;

  export function instance() { return binding ? binding.instance : null; }

  onMount(() => {
    binding = bindViewer({ viewer: 'form', factory: createForm, element: el, registry: null });
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
