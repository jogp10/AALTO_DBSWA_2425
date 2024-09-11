<script>
let list = ["Never", "gonna", "give", "you", "up"];
let index = 0;

const updateIndex = () => {
  index++;

  if (index >= list.length) {
    index = 0;
  }
};
</script>

<h1>{list[index]}</h1>
<button on:click={updateIndex}>Next!</button>