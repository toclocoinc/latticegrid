<script>
  import { onMount, onDestroy, getContext } from 'svelte';
  import { createTabs } from '@toclocoinc/lattice-grid/modules/tabs';
  import { createGrid } from '@toclocoinc/lattice-grid';
  import { bindTabs, snippetTabIds } from '@toclocoinc/lattice-grid/modules/svelte';

  let {
    class: klass = '', style = '', id = undefined, tabs = [], ...props
  } = $props();

  let el = $state(null);
  let open = $state([]);
  let holders = $state({});
  let binding = null;

  const contentIds = $derived(snippetTabIds(tabs, props));

  export function instance() { return binding ? binding.instance : null; }

  onMount(() => {
    binding = bindTabs({
      createTabs,
      createGrid,
      element: el,
      onPanels: (ids) => { open = ids; },
    });
    binding.sync({ ...props, tabs, contentIds });
  });

  onDestroy(() => {
    if (binding) binding.destroy({ ...props, tabs, contentIds });
    binding = null;
  });

  $effect(() => {
    const now = { ...props, tabs, contentIds };
    if (binding) binding.sync(now);
  });

  $effect(() => {
    for (const tabId of open) {
      if (binding) binding.place(tabId, holders[tabId]);
    }
  });
</script>

<div bind:this={el} class={klass} {style} {id}></div>

{#each open as tabId (tabId)}
  <div bind:this={holders[tabId]} style="display: contents">
    {@render props[tabId]()}
  </div>
{/each}
