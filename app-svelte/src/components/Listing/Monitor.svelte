<script>
    import Editor from "./Editor.svelte";
    let texts = [];

    const handleAddText = (newText) => {
        if (newText.trim() !== "") {
        texts = [...texts, newText];
        }
    }
</script>
  
<Editor submitText={handleAddText} />

<ul>
  {#each texts as text}
    <li>{text}</li>
  {/each}
</ul>