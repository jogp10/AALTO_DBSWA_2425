<script>
  import { userUuid } from "../stores/stores";

  let content = '';
  export let questionId;

  const handleAnswerSubmit = async (newAnswer) => {
    // Call API to add question
    newAnswer.user_uuid = $userUuid;
    newAnswer.question_id = questionId;

    await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnswer),
    });
  }
</script>

<form 
  id="answer-form" 
  on:submit|preventDefault={() => handleAnswerSubmit({ content })} 
  class="answer-form space-y-4"
>
  <textarea 
    id="answer-content-textarea"
    bind:value={content} 
    placeholder="Write your answer" 
    required 
    class="answer-content-textarea w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  ></textarea>
  <button 
    id="submit-answer-button"
    type="submit" 
    class="submit-answer-button px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Post Answer
  </button>
</form>
