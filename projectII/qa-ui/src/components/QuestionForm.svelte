<script>
  import { userUuid } from "../stores/stores";
  
  let title = '';
  let content = '';
  export let courseId;

  const handleQuestionSubmit = async (newQuestion) => {
    // Call API to add question
    newQuestion.user_uuid = $userUuid;

    await fetch(`/api/courses/${courseId}/questions`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
    });
  }
</script>

<form on:submit|preventDefault={() => handleQuestionSubmit({ title, content })}>
  <input type="text" bind:value={title} placeholder="Question title" required />
  <textarea bind:value={content} placeholder="Question details" required></textarea>
  <button type="submit">Post Question</button>
</form>
