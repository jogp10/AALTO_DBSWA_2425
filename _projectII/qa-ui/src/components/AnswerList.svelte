<script>
  import { onMount } from "svelte";
  import { userUuid } from "../stores/stores";
  import InfiniteScroll from "./InfiniteScroll.svelte";
  
  export let questionId;

  let page = 1;
  let answers = [];
  let newAnswers = [];

  let ws;

  const fetchAnswers = async () => {
    const answers = await fetch(`/api/questions/${questionId}/answers?page=${page}&user_uuid=${$userUuid}`);
    newAnswers = await answers.json();
  };

  const handleUpvote = async (answerId) => {
    // Call API to upvote answer
    await fetch(`/api/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_uuid: $userUuid, type: 'answer', id: answerId }),
    });

    window.location.reload();
  };

  const subscribeToUpdates = async () => {
    const host = window.location.hostname;
    ws = new WebSocket("/api/subscribe_updates");

    ws.onmessage = (event) => {
      console.log("message");
      console.log(event.data);
      const parsedData = JSON.parse(event.data);
      if (parsedData.question_id == questionId) answers = [parsedData, ...answers];
    };
  };

  onMount(()=> {
    fetchAnswers();
    subscribeToUpdates();

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
	})  
 
  $: if (newAnswers.length) {
    answers = [
      ...answers,
      ...newAnswers
    ];
    newAnswers = [];
  }
</script>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }
</style>

<ul id="answers-list" class="answers-list space-y-4 my-1">
  {#each answers as answer}
    <li 
      id={`answer-${answer.id}`} 
      class="answer-item p-4 border border-gray-300 rounded-md transition duration-200 ease-in-out hover:bg-gray-100 text-sm"
    >
      <p id={`answer-content-${answer.id}`} class="answer-content mb-2">{answer.content}</p>
      <p id={`answer-votes-${answer.id}`} class="answer-votes mb-2">Votes: {answer.votes}</p>
      <button 
        id={`upvote-btn-${answer.id}`}
        on:click={() => handleUpvote(answer.id)} 
        class="upvote-button px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#if answer.upvoted}
          Downvote
        {:else}
          Upvote
        {/if}
      </button>
      {#if answer.is_generated}
        <p id={`ai-generated-${answer.id}`} class="ai-generated mt-2 text-gray-500">AI Generated answer</p>
      {:else}
        <p id={`answer-author-${answer.id}`} class="answer-author mt-2 text-gray-500">By {answer.user_uuid} at {answer.created_at}</p>
      {/if}
    </li>
  {/each}
  <InfiniteScroll
    id="infinite-scroll-answers"
    hasMore={newAnswers.length}
    threshold={100}
    on:loadMore={() => {page++; fetchAnswers()}} 
    class="mt-4"
  />
</ul>

