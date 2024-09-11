<script>
    let inputText = "";
  
    export let submitText;

    const pushText = () => {
        submitText(inputText); 
        inputText = "";
    }
</script>

<input type="text" bind:value={inputText}/>
<button on:click={pushText}>Add text</button>