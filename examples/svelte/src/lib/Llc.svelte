<script>
  import { createDrawer } from "@uip/core";
  import {
    createDrawerStore,
    drawerTrigger,
    drawerContent,
  } from "@uip/adapter-svelte";

  const core = createDrawer();
  const store = createDrawerStore(); // หรือ createPrimitiveStore(core)

  let s = $state(core.getState());
  const stop = core.onChange((v) => {
    s = v;
  });
  // onDestroy(() => stop())
</script>

<button use:drawerTrigger={core} onclick={() => store.toggle()}> Open </button>

<div
  use:drawerContent={{ drawer: core, options: { trapFocus: true } }}
  class:open={s.isOpen}
>
  Drawer content
</div>
