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

<form 
  id="question-form" 
  on:submit|preventDefault={() => handleQuestionSubmit({ title, content })} 
  class="question-form space-y-4"
>
  <input 
    id="question-title-input"
    type="text" 
    bind:value={title} 
    placeholder="Question title" 
    required 
    class="question-title-input w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <textarea 
    id="question-content-textarea"
    bind:value={content} 
    placeholder="Question details" 
    required 
    class="question-content-textarea w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  ></textarea>
  <button 
    id="submit-question-button"
    type="submit" 
    class="submit-question-button px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Post Question
  </button>
</form>
