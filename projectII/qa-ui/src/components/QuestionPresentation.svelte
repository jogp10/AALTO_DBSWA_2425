<script>
    import { userUuid } from "../stores/stores";
    
    export let questionId;

    const fetchQuestion = async (questionId) => {
        const question = await fetch(`/api/questions/${questionId}`);
        return await question.json();
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

    let questionPromise = fetchQuestion(questionId);
</script>

{#await questionPromise}
    <p>Loading...</p>
{:then question}
    <h1>{question.title}</h1>
    <p>{question.content}</p>
    <p>By {question.user_uuid} at {question.created_at}</p>
    <p>Votes: {question.votes}</p>
    <!-- <button on:click={() => handleUpvote(question.id)}>Upvote</button> -->
{:catch error}
    <p style="color: red;">{error.message}</p>
{/await}