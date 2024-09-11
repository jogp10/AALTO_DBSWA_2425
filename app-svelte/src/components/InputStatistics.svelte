<script>
  let inputValue = '';
  let numbers = [];
  let average = 0;
  let sum = 0;

  const addNumber = () => {
    const number = parseFloat(inputValue);
    
    if (!isNaN(number)) {
      numbers = [...numbers, number];
      sum += number;
      average = sum / numbers.length;
    }

    inputValue = '';
  };
</script>

<h1>Statistics Generator</h1>

<input type="number" bind:value="{inputValue}"/>
<button on:click="{addNumber}">Add value</button>

<h2>Statistics</h2>

<p>Sum: {sum}</p>
<p>Total numbers: {numbers.length}</p>
<p>Average: {average}</p>

<h2>Numbers entered so far</h2>

<ul>
  {#each numbers as n}
    <li>{n}</li>
  {/each}
</ul>
