<script>
  import {onMount} from "svelte";
  import { userUuid } from "../stores/stores";
  import InfiniteScroll from "./InfiniteScroll.svelte";
  
  export let questionId;

  let page = 1;
  let answers = [];
  let newAnswers = [];

  const fetchAnswers = async () => {
    const answers = await fetch(`/api/questions/${questionId}/answers?page=${page}`);
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
  };

  onMount(()=> {
		fetchAnswers();
	})

  $: answers = [
		...answers,
    ...newAnswers
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


<ul>
  {#each answers as answer}
    <li>
      <p>{answer.content}</p>
      <p>Votes: {answer.votes}</p>
      <button on:click={() => handleUpvote(answer.id)}>Upvote</button>
      {#if answer.is_generated}
        <p>AI Generated answer</p>
      {:else}
        <p>By {answer.user_uuid} at {answer.created_at}</p>
      {/if}
    </li>
  {/each}
  <InfiniteScroll
  hasMore={newAnswers.length}
  threshold={100}
  on:loadMore={() => {page++; fetchQuestions()}} />
</ul>

