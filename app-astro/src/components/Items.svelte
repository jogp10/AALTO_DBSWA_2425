<script>
    let item = "";
    const getItems = async () => {
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
</script>
  
<h1>Items</h1>


<input type="text" bind:value={item} />
<button on:click={addItem}>Add item</button>

{#await itemsPromise}
<p>Loading items</p>
{:then items}
{#if items.length == 0}
    <p>No items available</p>
{:else}
    <ul>
    {#each items as item}
        <li>{item.item}</li>
    {/each}
    </ul>
{/if}
{/await}