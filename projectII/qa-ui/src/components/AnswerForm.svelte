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

<form on:submit|preventDefault={() => handleAnswerSubmit({ content })}>
  <textarea bind:value={content} placeholder="Write your answer" required></textarea>
  <button type="submit">Post Answer</button>
</form>
