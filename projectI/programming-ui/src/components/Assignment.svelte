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

  async function submitCode(assignment_id) {
    statusMessage = "Submitting your code...";

    const data = {
      user_uuid: $userUuid,
      code: userCode,
      programming_assignment_id: assignment_id,
    };

    const response = await fetch("/api/assignment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      statusMessage = "Code submitted successfully!";
    } else {
      statusMessage = "Failed to submit code. Please try again.";
    }
  }

  let assignmentPromise = fetchAssignment();

  onMount(() => {});
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
      <button on:click={() => submitCode(assignment.id)}>Submit</button>
      <GradingButton />
      {#if statusMessage == "success"}
        <button on:click={() => submitCode(assignment.id)}>Next Assignment</button>
      {/if}
      {#if statusMessage}
        <p>{statusMessage}</p>
      {/if}
      {#if feedback}
        <pre>{feedback.suggestions}</pre>
        {#each feedback.errors as error}
          <pre>{error}</pre>
        {/each}
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
