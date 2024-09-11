<script>
  let message = "Svelte";

  const updateText = () => {
    message = message == "Astro" ? "Svelte" : "Astro";
  };
</script>

<h1>Hello {message}!</h1>
<button on:click={updateText}>Update!</button>
