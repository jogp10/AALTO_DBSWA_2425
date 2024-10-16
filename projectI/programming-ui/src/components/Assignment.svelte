<script>
  import GradingButton from "./GradingButton.svelte";
  import { onMount } from "svelte";
  import { userUuid } from "../stores/stores";
  let userCode = "";
  let statusMessage = "";
  let feedback = "";
  let isCompleted = false;

  // This function could simulate fetching data from an API
  const fetchAssignment = async () => {
    // return {
    //   name: "Basic Calculator",
    //   handout:
    //     "Write a Python function to add, subtract, multiply, and divide two numbers.",
    // };
    const response = await fetch("/api/assignment/" + $userUuid);
    return await response.json();
  };

  const fetchUserProgress = async () => {
    const response = await fetch("/api/progress/" + $userUuid);
    return await response.json();
  };

  const fetchTotalProgress = async () => {
    const response = await fetch("/api/assignment");
    return await response.json().length;
  };

  async function submitCode() {
    statusMessage = "Submitting your code for grading...";

    // Simulating an async submission (like an API request)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate code grading
    const isSuccessful = Math.random() > 0.5;
    if (isSuccessful) {
      statusMessage =
        "Congratulations! You have successfully completed the assignment.";
      isCompleted = true;
    } else {
      statusMessage = "There are issues with your code.";
      feedback = "Error: Division by zero found on line 4.";
    }
  }

  let assignmentPromise = fetchAssignment();

  onMount(() => {
  });
</script>

<article>
  {#await assignmentPromise}
    <p>Loading assignment...</p>
  {:then assignment}
    <h2>{assignment.title}</h2>
    <p>{assignment.handout}</p>
    {#if !isCompleted}
      <textarea
        bind:value={userCode}
        placeholder="Write your Python code here..."
        rows="10"
      ></textarea>
      <button on:click={submitCode}>Submit</button>
      <GradingButton client:only={"svelte"} />
      {#if statusMessage}
        <p>{statusMessage}</p>
      {/if}
      {#if feedback}
        <pre>{feedback}</pre>
      {/if}
    {:else}
      <p>You have successfully completed this assignment!</p>
      <button on:click={() => location.reload()}>Start Next Assignment</button>
    {/if}
  {/await}
</article>

<style>
  textarea {
    width: 100%;
    font-family: monospace;
  }
  button {
    margin-top: 10px;
    padding: 10px;
  }
  p {
    margin-top: 10px;
  }
</style>
