<script>
  import {onMount} from "svelte";
  import { userUuid } from "../stores/stores";
  import InfiniteScroll from "./InfiniteScroll.svelte";

  export let courseId;

  let page = 1;
  let questions = [];
  let newQuestions = [];

  let ws;

  const fetchQuestions = async () => {
    const questions = await fetch(`/api/courses/${courseId}/questions?page=${page}&user_uuid=${$userUuid}`);
    newQuestions = await questions.json();
  };

  const handleUpvote = async (questionId) => {
    // Call API to upvote answer
    await fetch(`/api/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_uuid: $userUuid, type: 'question', id: questionId }),
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
      console.log(parsedData.course_id == courseId);
      if (parsedData.course_id == courseId) {
        questions = [parsedData, ...questions];
      }
    };
  };

  onMount(()=> {
		fetchQuestions();
    subscribeToUpdates();

    return () => {
      if (ws.readyState === 1) {
        ws.close();
      }
    };
	})  

  $: questions = [
		...questions,
    ...newQuestions
  ];
</script>

<style>
  ul {
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    width: 100%;
    max-height: 70vh;
    overflow-y: scroll;
  }

  li {
    padding: 15px;
    box-sizing: border-box;
    transition: 0.2s all;
    font-size: 14px;
  }

  li:hover {
    background-color: #eeeeee;
  }
</style>

<ul class="space-y-4 my-1">
  {#each questions as question}
  <li class="p-4 border border-gray-300 rounded-md transition duration-200 ease-in-out hover:bg-gray-100">
    <a href={`/question/${question.id}`} class="text-blue-500 hover:underline">{question.title}</a>
    <p class="text-sm text-gray-700">{question.content}</p>
    <p class="text-sm text-gray-500">Votes: {question.votes}</p>
    <button 
      on:click={() => handleUpvote(question.id)} 
      class="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#if question.upvoted}
        Downvote
      {:else}
        Upvote
      {/if}
    </button>
  </li>
  {/each}
  <InfiniteScroll
  hasMore={newQuestions.length}
  threshold={100}
  on:loadMore={() => {page++; fetchQuestions()}}
  class="mt-4"
  />
</ul>