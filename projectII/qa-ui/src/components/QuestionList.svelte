<script>
  import {onMount} from "svelte";
  import { userUuid } from "../stores/stores";
  import InfiniteScroll from "./InfiniteScroll.svelte";

  export let courseId;

  let page = 1;
  let questions = [];
  let newQuestions = [];


  const fetchQuestions = async () => {
    const questions = await fetch(`/api/courses/${courseId}/questions?page=${page}`);
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
  };

  onMount(()=> {
		fetchQuestions();
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

<ul>
  {#each questions as question}
    <li>
      <a href={`/question/${question.id}`}>{question.title}</a>
      <p>Votes: {question.votes}</p>
      <button on:click={() => handleUpvote(question.id)}>Upvote</button>
      <p>By {question.user_uuid} at {question.created_at}</p>
    </li>
  {/each}
  <InfiniteScroll
  hasMore={newQuestions.length}
  threshold={100}
  on:loadMore={() => {page++; fetchQuestions()}} />
</ul>