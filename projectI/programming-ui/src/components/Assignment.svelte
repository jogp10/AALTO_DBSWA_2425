<script>
  import { onMount } from "svelte";
  import { userUuid } from "../stores/stores";
  let userCode = "";
  let statusMessage = "";
  let feedback = "";
  let submissionFeedback = "";
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
    feedback = "";
    submissionFeedback = "";

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

    const result_data = await response.json();

    if (response.ok) {
      if (!result_data.graded) {
        statusMessage = "Code submitted successfully!";
        connectToProgressUpdates(result_data.submissionId)
        feedback = "Waiting for feedback... (Opened a connection to the server)";
      } else {
        statusMessage = "Code not sent for grading, duplicated submission.";
        feedback = result_data.graded.grader_feedback;
        isCompleted = result_data.graded.correct;
      }
    } else {
      statusMessage = "Failed to submit code. Please try again.";
    }
  }

  function connectToProgressUpdates(submissionId) {
    let eventSource = new EventSource(`/api/grading/${submissionId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        submissionFeedback = data.feedback;  // Update feedback with the received data
        isCompleted = data.correct;
        console.log("Feedback received:", data);
        eventSource.close();
      } catch (error) {
        console.error("Error parsing feedback data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error with SSE connection:", error);
      eventSource.close();
    };
  }
 
  let assignmentPromise = fetchAssignment();

  onMount(() => {});
</script>

<article class="p-6" id="assignmentContainer">
  {#await assignmentPromise}
    <p class="text-gray-600" id="loadingMessage">Loading assignment...</p>
  {:then assignment}

    <!-- All assignments completed message -->
    {#if assignment.completed}
      <h2 class="text-xl font-semibold mb-4" id="completionTitle">Congratulations!</h2>
      <p class="text-green-600 font-medium" id="completionMessage">
        You have successfully completed all assignments. Great job!
      </p>

    <!-- Assignment details and submission box -->
    {:else}
      <h2 class="text-xl font-semibold mb-4" id="assignmentTitle">{assignment.title}</h2>
      <p class="mb-6" id="assignmentHandout">{assignment.handout}</p>

      {#if !isCompleted}
        <textarea
          id="codeEditor"
          bind:value={userCode}
          placeholder="Write your Python code here..."
          rows="10"
          class="w-full p-3 border border-gray-300 rounded-md font-mono"
        ></textarea>

        <div class="flex items-center">
          <button
            id="submitButton"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
            on:click={() => submitCode(assignment.id)}
            aria-label="Submit Code"
          >
            Submit
          </button>

          <!-- Status Message Display -->
          {#if statusMessage}
            <p id="statusMessage" class="text-blue-600 font-medium self-auto">{statusMessage}</p>
          {/if}
        </div>

        {#if feedback && !submissionFeedback}
          <pre id="feedback" class="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">{feedback}</pre>
        {/if}

        {#if submissionFeedback}
          <pre id="submission_feedback" class="mt-4 p-4 bg-gray-100 border border-gray-300 rounded">{submissionFeedback}</pre>
        {/if}

      {:else}
        <p id="successMessage" class="text-green-600 font-semibold mt-4">
          You have successfully completed this assignment!
        </p>
        <button
          id="nextAssignmentButton"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
          on:click={() => location.reload()}
          aria-label="Start Next Assignment"
        >
          Start Next Assignment
        </button>
      {/if}
    {/if}

  {:catch error}
    <p id="errorMessage" class="text-red-500">Error loading assignment: {error.message}</p>
  {/await}
</article>

<style>
</style>

