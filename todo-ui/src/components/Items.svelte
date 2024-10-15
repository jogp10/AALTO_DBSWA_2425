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

    const deleteItem = async (id) => {
        await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        });

        itemsPromise = getItems();
    };
</script>
  
<h1>Todos</h1>


<input type="text" bind:value={item} />
<button on:click={addItem}>Add todo</button>

{#await itemsPromise}
<p>Loading todos</p>
{:then items}
{#if items.length == 0}
    <p>No todos available</p>
{:else}
    <ul>
    {#each items as item}
        <li>
            {item.item}
            <button on:click={() => deleteItem(item.id)}>Remove</button>
        </li>
    {/each}
    </ul>
{/if}
{/await}