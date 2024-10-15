<script>
  import Card from "./Card.svelte";

  export let items = [];

  function handleMessage(event) {
    messageFromChild = event.detail.value;
    dispatch("delete", { value: messageFromChild });
  }
</script>

<section class="grid grid-cols-4 gap-4">
  {#each items as item}
    <Card title={item.item} description={item.id} on:delete={handleMessage} />
  {/each}
</section>
