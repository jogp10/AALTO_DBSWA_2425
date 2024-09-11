<script>
    import { items } from "./itemStore.js";

    let newItem = "";

    const pushItem = () => {
        items.update((items) => [...items, newItem]);
        newItem = "";
    };
</script>
  
<h2>Add an item</h2>

<input type="text" bind:value={newItem}/>
<button on:click={pushItem}>Add!</button>
