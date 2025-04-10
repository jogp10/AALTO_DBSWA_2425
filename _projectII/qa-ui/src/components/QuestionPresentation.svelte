<script>
    import { userUuid } from "../stores/stores";
    
    export let questionId;
    let upvoted = false;

    const fetchQuestion = async (questionId) => {
        const question = await fetch(`/api/questions/${questionId}?user_uuid=${$userUuid}`);
        const questionJson = await question.json();
        upvoted = questionJson.upvoted;
        return questionJson;
    };

    const handleUpvote = async (questionId) => {
        // Call API to upvote answer
        const response = await fetch(`/api/upvote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_uuid: $userUuid, type: 'question', id: questionId }),
        });

        response.ok ? upvoted = !upvoted : upvoted;
    };

    let questionPromise = fetchQuestion(questionId);
</script>

{#await questionPromise}
    <p class="text-gray-500">Loading...</p>
{:then question}
    <div class="space-y-4">
        <h1 class="text-2xl font-bold">{question.title}</h1>
        <p class="text-base text-gray-700">{question.content}</p>
        <p class="text-sm text-gray-500">By {question.user_uuid} at {question.created_at}</p>
        <button 
            on:click={() => handleUpvote(question.id)} 
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {#if upvoted}
                Downvote
            {:else}
                Upvote
            {/if}
        </button>
    </div>
{:catch error}
    <p class="text-red-500">{error.message}</p>
{/await}