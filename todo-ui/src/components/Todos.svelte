<script>
  import Card from "./Card.svelte";
  import CardCollection from "./CardCollection.svelte";

  let item = "";
  const getItems = async () => {
    // return await [
    //   { id: 1, item: "Item 1" },
    //   { id: 2, item: "Item 2" },
    // ];
    const response = await fetch("/api/todos");
    return await response.json();
  };

  let itemsPromise = getItems();

  const addItem = async () => {
    if (item.length == 0) {
      return;
    }

    const newItem = { item };

    await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(newItem),
    });

    item = "";

    itemsPromise = getItems();
  };

  const deleteItem = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });

    itemsPromise = getItems();
  };
</script>

<h1>Todos</h1>

<input
  class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
  bind:value={item}
/>
<button on:click={addItem}>Add todo</button>

{#await itemsPromise}
  <p>Loading todos</p>
{:then items}
  {#if items.length == 0}
    <p>No todos available</p>
  {:else}
    <div class="m-3">
      <CardCollection {items} on:delete={deleteItem(event)}/>
    </div>
  {/if}
{/await}
