<script>  
    export let courseId;

    const fetchCourse = async (courseId) => {
        const course = await fetch(`/api/courses/${courseId}`);
        return await course.json();
    };

    let coursePromise = fetchCourse(courseId);
</script>

{#await coursePromise}
    <p class="text-gray-500">Loading...</p>
{:then course}
    <div class="space-y-4">
        <h1 class="text-2xl font-bold">{course.name}</h1>
        <p class="text-base text-gray-700">{course.description}</p>
    </div>
{:catch error}
    <p class="text-red-500">{error.message}</p>
{/await}