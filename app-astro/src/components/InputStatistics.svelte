<script>
    let numbers = [];
    let input = "";
    let sum = 0;
    let average = 0;
  
    const add = () => {
      let val;
      try {
        val = parseInt(input);
      } catch (e) {
        alert("Type in a number");
        return;
      }
  
      numbers = [...numbers, val];
      input = "";
    };
  
    $: sum = numbers.reduce((total, current) => total + current, 0);
    $: average = numbers.length > 0 ? sum / numbers.length : "-";
  </script>
  
  <h1>Statistics generator</h1>
  
  <input bind:value={input} type="number" />
  <button on:click={add}>Add value</button>
  
  <h2>Statistics</h2>
  
  <p>Sum: {sum}</p>
  <p>Total numbers: {numbers.length}</p>
  <p>Average: {average}</p>
  
  <h2>Numbers entered so far</h2>
  
  <ul>
    {#each numbers as num}
      <li>{num}</li>
    {/each}
  </ul>
  